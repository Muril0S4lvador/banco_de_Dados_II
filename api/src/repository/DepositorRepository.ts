import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Depositor } from '../entity/Depositor';

export class DepositorRepository {
    private tableName: string = 'depositor';

    async list(): Promise<Array<Depositor & { __id: string }>> {
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(command);

        return (result.Items || []).map((item: any) => ({
            ...item,
            __id: `${item.customer_name ?? ''}::${item.account_number ?? ''}`,
        })) as Array<Depositor & { __id: string }>;
    }

    async getById(itemId: string): Promise<(Depositor & { __id: string }) | null> {
        const [customer_name, account_number] = itemId.split('::');
        if (!customer_name || !account_number) {
            throw new Error('itemId inválido, esperado "customer_name::account_number"');
        }
        const command = new GetCommand({ TableName: this.tableName, Key: { customer_name, account_number } });
        const result = await dynamoDBClient.send(command);
        if (!result.Item) return null;

        return {
            ...(result.Item as Depositor),
            __id: `${customer_name}::${account_number}`,
        } as Depositor & { __id: string };
    }

    async create(itemData: Partial<Depositor>): Promise<Depositor & { __id: string }> {
        if (!itemData.customer_name || !itemData.account_number) {
            throw new Error('customer_name e account_number são obrigatórios');
        }

        const withKeys = { ...itemData } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: withKeys });
        await dynamoDBClient.send(command);

        return {
            ...(withKeys as Depositor),
            __id: `${withKeys.customer_name}::${withKeys.account_number}`,
        } as Depositor & { __id: string };
    }

    async update(itemId: string, itemData: Partial<Depositor>): Promise<Depositor & { __id: string }> {
        const [customer_name, account_number] = itemId.split('::');
        if (!customer_name || !account_number) {
            throw new Error('itemId inválido, esperado "customer_name::account_number"');
        }
        const merged = { ...itemData, customer_name, account_number } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: merged });
        await dynamoDBClient.send(command);

        return {
            ...(merged as Depositor),
            __id: `${customer_name}::${account_number}`,
        } as Depositor & { __id: string };
    }

    async delete(itemId: string): Promise<void> {
        const [customer_name, account_number] = itemId.split('::');
        if (!customer_name || !account_number) {
            throw new Error('itemId inválido, esperado "customer_name::account_number"');
        }
        const command = new DeleteCommand({ TableName: this.tableName, Key: { customer_name, account_number } });
        await dynamoDBClient.send(command);
    }
}
