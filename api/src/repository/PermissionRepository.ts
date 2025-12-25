import { DescribeTableCommand, KeySchemaElement } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Permission, PermissionEntity } from '../entity/Permission';

export class PermissionRepository {
    private tableName: string = 'Permissions';

    private async getKeySchema(): Promise<KeySchemaElement[]> {
        const describe = new DescribeTableCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(describe);
        return result.Table?.KeySchema || [];
    }

    private buildItemId(item: Record<string, any>, keySchema: KeySchemaElement[]): string {
        if (!keySchema || keySchema.length === 0) return '';
        const hashKey = keySchema.find(k => k.KeyType === 'HASH')?.AttributeName;
        const rangeKey = keySchema.find(k => k.KeyType === 'RANGE')?.AttributeName;

        const parts: string[] = [];
        if (hashKey) parts.push(String(item[hashKey] ?? ''));
        if (rangeKey) parts.push(String(item[rangeKey] ?? ''));

        return parts.filter(Boolean).join('::');
    }

    private buildKeyFromItemId(itemId: string, keySchema: KeySchemaElement[]): Record<string, any> {
        const hashKey = keySchema.find(k => k.KeyType === 'HASH')?.AttributeName;
        const rangeKey = keySchema.find(k => k.KeyType === 'RANGE')?.AttributeName;

        const parts = itemId.split('::');
        const key: Record<string, any> = {};

        if (hashKey) key[hashKey] = parts[0];
        if (rangeKey && parts.length > 1) key[rangeKey] = parts[1];

        return key;
    }

    async list(): Promise<Array<Permission & { __id: string }>> {
        const keySchema = await this.getKeySchema();
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(command);

        return (result.Items || []).map((item: any) => ({
            ...item,
            __id: this.buildItemId(item, keySchema),
        })) as Array<Permission & { __id: string }>;
    }

    async getById(itemId: string): Promise<(Permission & { __id: string }) | null> {
        const keySchema = await this.getKeySchema();
        const key = this.buildKeyFromItemId(itemId, keySchema);
        const command = new GetCommand({ TableName: this.tableName, Key: key });
        const result = await dynamoDBClient.send(command);
        if (!result.Item) return null;

        return {
            ...(result.Item as Permission),
            __id: this.buildItemId(result.Item, keySchema),
        } as Permission & { __id: string };
    }

    async create(itemData: Partial<Permission>): Promise<Permission & { __id: string }> {
        const permissionEntity = new PermissionEntity(itemData);

        const keySchema = await this.getKeySchema();
        const withKeys = permissionEntity.toDynamoDB();
        const command = new PutCommand({ TableName: this.tableName, Item: withKeys });
        await dynamoDBClient.send(command);

        return {
            ...(withKeys as Permission),
            __id: this.buildItemId(withKeys, keySchema),
        } as Permission & { __id: string };
    }

    async update(itemId: string, itemData: Partial<Permission>): Promise<Permission & { __id: string }> {
        const keySchema = await this.getKeySchema();
        const key = this.buildKeyFromItemId(itemId, keySchema);
        const merged = { ...itemData, ...key } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: merged });
        await dynamoDBClient.send(command);

        return {
            ...(merged as Permission),
            __id: this.buildItemId(merged, keySchema),
        } as Permission & { __id: string };
    }

    async delete(itemId: string): Promise<void> {
        const keySchema = await this.getKeySchema();
        const key = this.buildKeyFromItemId(itemId, keySchema);
        const command = new DeleteCommand({ TableName: this.tableName, Key: key });
        await dynamoDBClient.send(command);
    }
}
