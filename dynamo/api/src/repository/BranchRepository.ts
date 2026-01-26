import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Branch } from '../entity/Branch';

export class BranchRepository {
    private tableName: string = 'branch';

    async list(): Promise<Array<Branch & { __id: string }>> {
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(command);

        return (result.Items || []).map((item: any) => ({
            ...item,
            __id: String(item.branch_name ?? ''),
        })) as Array<Branch & { __id: string }>;
    }

    async getById(itemId: string): Promise<(Branch & { __id: string }) | null> {
        const command = new GetCommand({ TableName: this.tableName, Key: { branch_name: itemId } });
        const result = await dynamoDBClient.send(command);
        if (!result.Item) return null;

        return {
            ...(result.Item as Branch),
            __id: String(result.Item.branch_name ?? ''),
        } as Branch & { __id: string };
    }

    async create(itemData: Partial<Branch>): Promise<Branch & { __id: string }> {
        if (!itemData.branch_name) {
            throw new Error('branch_name é obrigatório');
        }

        const withKeys = { ...itemData } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: withKeys });
        await dynamoDBClient.send(command);

        return {
            ...(withKeys as Branch),
            __id: String(withKeys.branch_name ?? ''),
        } as Branch & { __id: string };
    }

    async update(itemId: string, itemData: Partial<Branch>): Promise<Branch & { __id: string }> {
        const merged = { ...itemData, branch_name: itemId } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: merged });
        await dynamoDBClient.send(command);

        return {
            ...(merged as Branch),
            __id: String(merged.branch_name ?? ''),
        } as Branch & { __id: string };
    }

    async delete(itemId: string): Promise<void> {
        const command = new DeleteCommand({ TableName: this.tableName, Key: { branch_name: itemId } });
        await dynamoDBClient.send(command);
    }
}
