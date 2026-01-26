import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Borrower } from '../entity/Borrower';

export class BorrowerRepository {
    private tableName: string = 'borrower';

    async list(): Promise<Array<Borrower & { __id: string }>> {
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(command);

        return (result.Items || []).map((item: any) => ({
            ...item,
            __id: `${item.customer_name ?? ''}::${item.loan_number ?? ''}`,
        })) as Array<Borrower & { __id: string }>;
    }

    async getById(itemId: string): Promise<(Borrower & { __id: string }) | null> {
        const [customer_name, loan_number] = itemId.split('::');
        if (!customer_name || !loan_number) {
            throw new Error('itemId inválido, esperado "customer_name::loan_number"');
        }
        const command = new GetCommand({ TableName: this.tableName, Key: { customer_name, loan_number } });
        const result = await dynamoDBClient.send(command);
        if (!result.Item) return null;

        return {
            ...(result.Item as Borrower),
            __id: `${customer_name}::${loan_number}`,
        } as Borrower & { __id: string };
    }

    async create(itemData: Partial<Borrower>): Promise<Borrower & { __id: string }> {
        if (!itemData.customer_name || !itemData.loan_number) {
            throw new Error('customer_name e loan_number são obrigatórios');
        }

        const withKeys = { ...itemData } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: withKeys });
        await dynamoDBClient.send(command);

        return {
            ...(withKeys as Borrower),
            __id: `${withKeys.customer_name}::${withKeys.loan_number}`,
        } as Borrower & { __id: string };
    }

    async update(itemId: string, itemData: Partial<Borrower>): Promise<Borrower & { __id: string }> {
        const [customer_name, loan_number] = itemId.split('::');
        if (!customer_name || !loan_number) {
            throw new Error('itemId inválido, esperado "customer_name::loan_number"');
        }
        const merged = { ...itemData, customer_name, loan_number } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: merged });
        await dynamoDBClient.send(command);

        return {
            ...(merged as Borrower),
            __id: `${customer_name}::${loan_number}`,
        } as Borrower & { __id: string };
    }

    async delete(itemId: string): Promise<void> {
        const [customer_name, loan_number] = itemId.split('::');
        if (!customer_name || !loan_number) {
            throw new Error('itemId inválido, esperado "customer_name::loan_number"');
        }
        const command = new DeleteCommand({ TableName: this.tableName, Key: { customer_name, loan_number } });
        await dynamoDBClient.send(command);
    }
}
