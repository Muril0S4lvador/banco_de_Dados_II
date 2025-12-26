import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Customer } from '../entity/Customer';

export class CustomerRepository {
    private tableName: string = 'customer';

    async list(): Promise<Array<Customer & { __id: string }>> {
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(command);

        return (result.Items || []).map((item: any) => ({
            ...item,
            __id: String(item.customer_name ?? ''),
        })) as Array<Customer & { __id: string }>;
    }

    async getById(itemId: string): Promise<(Customer & { __id: string }) | null> {
        const command = new GetCommand({ TableName: this.tableName, Key: { customer_name: itemId } });
        const result = await dynamoDBClient.send(command);
        if (!result.Item) return null;

        return {
            ...(result.Item as Customer),
            __id: String(result.Item.customer_name ?? ''),
        } as Customer & { __id: string };
    }

    async create(itemData: Partial<Customer>): Promise<Customer & { __id: string }> {
        if (!itemData.customer_name) {
            throw new Error('customer_name é obrigatório');
        }

        const withKeys = { ...itemData } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: withKeys });
        await dynamoDBClient.send(command);

        return {
            ...(withKeys as Customer),
            __id: String(withKeys.customer_name ?? ''),
        } as Customer & { __id: string };
    }

    async update(itemId: string, itemData: Partial<Customer>): Promise<Customer & { __id: string }> {
        const merged = { ...itemData, customer_name: itemId } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: merged });
        await dynamoDBClient.send(command);

        return {
            ...(merged as Customer),
            __id: String(merged.customer_name ?? ''),
        } as Customer & { __id: string };
    }

    async delete(itemId: string): Promise<void> {
        const command = new DeleteCommand({ TableName: this.tableName, Key: { customer_name: itemId } });
        await dynamoDBClient.send(command);
    }
}
