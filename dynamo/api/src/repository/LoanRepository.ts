import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Loan } from '../entity/Loan';

export class LoanRepository {
    private tableName: string = 'loan';

    async list(): Promise<Array<Loan & { __id: string }>> {
        const command = new ScanCommand({ TableName: this.tableName });
        const result = await dynamoDBClient.send(command);

        return (result.Items || []).map((item: any) => ({
            ...item,
            __id: String(item.loan_number ?? ''),
        })) as Array<Loan & { __id: string }>;
    }

    async getById(itemId: string): Promise<(Loan & { __id: string }) | null> {
        const command = new GetCommand({ TableName: this.tableName, Key: { loan_number: itemId } });
        const result = await dynamoDBClient.send(command);
        if (!result.Item) return null;

        return {
            ...(result.Item as Loan),
            __id: String(result.Item.loan_number ?? ''),
        } as Loan & { __id: string };
    }

    async create(itemData: Partial<Loan>): Promise<Loan & { __id: string }> {
        if (!itemData.loan_number) {
            throw new Error('loan_number é obrigatório');
        }

        const withKeys = { ...itemData } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: withKeys });
        await dynamoDBClient.send(command);

        return {
            ...(withKeys as Loan),
            __id: String(withKeys.loan_number ?? ''),
        } as Loan & { __id: string };
    }

    async update(itemId: string, itemData: Partial<Loan>): Promise<Loan & { __id: string }> {
        const merged = { ...itemData, loan_number: itemId } as Record<string, any>;
        const command = new PutCommand({ TableName: this.tableName, Item: merged });
        await dynamoDBClient.send(command);

        return {
            ...(merged as Loan),
            __id: String(merged.loan_number ?? ''),
        } as Loan & { __id: string };
    }

    async delete(itemId: string): Promise<void> {
        const command = new DeleteCommand({ TableName: this.tableName, Key: { loan_number: itemId } });
        await dynamoDBClient.send(command);
    }
}
