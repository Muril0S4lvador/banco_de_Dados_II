import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Account } from '../entity/Account';

export class AccountRepository {
    private tableName: string = 'account';

    async list(): Promise<Array<Account & { __id: string }>> {
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(command);

        return (result.Items || []).map((item: any) => ({
            ...item,
            __id: String(item.account_number ?? ''),
        })) as Array<Account & { __id: string }>;
    }

    async getById(itemId: string): Promise<(Account & { __id: string }) | null> {
        const command = new GetCommand({ TableName: this.tableName, Key: { account_number: itemId } });
        const result = await dynamoDBClient.send(command);
        if (!result.Item) return null;

        return {
            ...(result.Item as Account),
            __id: String(result.Item.account_number ?? ''),
        } as Account & { __id: string };
    }

    async create(itemData: Partial<Account>): Promise<Account & { __id: string }> {
        if (!itemData.account_number) {
            throw new Error('account_number é obrigatório');
        }

        const withKeys = { ...itemData } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: withKeys });
        await dynamoDBClient.send(command);

        return {
            ...(withKeys as Account),
            __id: String(withKeys.account_number ?? ''),
        } as Account & { __id: string };
    }

    async update(itemId: string, itemData: Partial<Account>): Promise<Account & { __id: string }> {
        const merged = { ...itemData, account_number: itemId } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: merged });
        await dynamoDBClient.send(command);

        return {
            ...(merged as Account),
            __id: String(merged.account_number ?? ''),
        } as Account & { __id: string };
    }

    async delete(itemId: string): Promise<void> {
        const command = new DeleteCommand({ TableName: this.tableName, Key: { account_number: itemId } });
        await dynamoDBClient.send(command);
    }
}
