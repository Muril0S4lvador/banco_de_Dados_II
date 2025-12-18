import { DescribeTableCommand, KeySchemaElement } from '@aws-sdk/client-dynamodb'
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { dynamoDBClient } from '../config/database'

export interface ListResult<T> {
    items: Array<T & { __id: string }>
}

export class DynamoTableHelper {
    static async getKeySchema(tableName: string): Promise<KeySchemaElement[]> {
        const describe = new DescribeTableCommand({ TableName: tableName })
        const result = await dynamoDBClient.send(describe)
        return result.Table?.KeySchema || []
    }

    static buildItemId(item: Record<string, any>, keySchema: KeySchemaElement[]): string {
        if (!keySchema || keySchema.length === 0) return ''
        const hashKey = keySchema.find(k => k.KeyType === 'HASH')?.AttributeName
        const rangeKey = keySchema.find(k => k.KeyType === 'RANGE')?.AttributeName

        const parts: string[] = []
        if (hashKey) parts.push(String(item[hashKey] ?? ''))
        if (rangeKey) parts.push(String(item[rangeKey] ?? ''))

        return parts.filter(Boolean).join('::')
    }

    static buildKeyFromItemId(itemId: string, keySchema: KeySchemaElement[]): Record<string, any> {
        const hashKey = keySchema.find(k => k.KeyType === 'HASH')?.AttributeName
        const rangeKey = keySchema.find(k => k.KeyType === 'RANGE')?.AttributeName

        const parts = itemId.split('::')
        const key: Record<string, any> = {}

        if (hashKey) key[hashKey] = parts[0]
        if (rangeKey && parts.length > 1) key[rangeKey] = parts[1]

        return key
    }

    static ensurePrimaryKeys(itemData: Record<string, any>, keySchema: KeySchemaElement[]): Record<string, any> {
        const withKeys = { ...itemData }
        keySchema.forEach(key => {
            const attr = key.AttributeName!
            if (withKeys[attr] === undefined || withKeys[attr] === null || withKeys[attr] === '') {
                withKeys[attr] = randomUUID()
            }
        })
        return withKeys
    }

    static async listItems<T extends Record<string, any>>(tableName: string): Promise<ListResult<T>> {
        const keySchema = await this.getKeySchema(tableName)
        const command = new ScanCommand({ TableName: tableName })
        const result = await dynamoDBClient.send(command)

        const itemsWithId = (result.Items || []).map((item: any) => ({
            ...item,
            __id: this.buildItemId(item, keySchema),
        })) as Array<T & { __id: string }>

        return { items: itemsWithId }
    }

    static async getItem<T extends Record<string, any>>(tableName: string, itemId: string): Promise<(T & { __id: string }) | null> {
        const keySchema = await this.getKeySchema(tableName)
        const key = this.buildKeyFromItemId(itemId, keySchema)
        const command = new GetCommand({ TableName: tableName, Key: key })
        const result = await dynamoDBClient.send(command)
        if (!result.Item) return null
        return {
            ...result.Item,
            __id: this.buildItemId(result.Item, keySchema),
        } as T & { __id: string }
    }

    static async createItem<T extends Record<string, any>>(tableName: string, itemData: Record<string, any>): Promise<T & { __id: string }> {
        const keySchema = await this.getKeySchema(tableName)
        const withKeys = this.ensurePrimaryKeys(itemData, keySchema)
        const command = new PutCommand({ TableName: tableName, Item: withKeys })
        await dynamoDBClient.send(command)
        return {
            ...withKeys,
            __id: this.buildItemId(withKeys, keySchema),
        } as T & { __id: string }
    }

    static async updateItem<T extends Record<string, any>>(tableName: string, itemId: string, itemData: Record<string, any>): Promise<T & { __id: string }> {
        const keySchema = await this.getKeySchema(tableName)
        const key = this.buildKeyFromItemId(itemId, keySchema)
        const merged = { ...itemData, ...key }
        const command = new PutCommand({ TableName: tableName, Item: merged })
        await dynamoDBClient.send(command)
        return {
            ...merged,
            __id: this.buildItemId(merged, keySchema),
        } as T & { __id: string }
    }

    static async deleteItem(tableName: string, itemId: string): Promise<void> {
        const keySchema = await this.getKeySchema(tableName)
        const key = this.buildKeyFromItemId(itemId, keySchema)
        const command = new DeleteCommand({ TableName: tableName, Key: key })
        await dynamoDBClient.send(command)
    }
}
