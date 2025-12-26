import { PutCommand, GetCommand, DeleteCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import { dynamoDBClient } from "../config/database"
import { Permission } from "../entity/Permission"

export class PermissionRepository {
    private tableName = 'Permissions'

    async create(permission: Omit<Permission, '__id'>): Promise<Permission> {
        const id = `${permission.roleId}::${permission.tableName}`
        const item = {
            ...permission,
            __id: id
        }

        const command = new PutCommand({
            TableName: this.tableName,
            Item: item
        })

        await dynamoDBClient.send(command)
        return item as Permission
    }

    async getById(id: string): Promise<Permission | null> {
        const command = new GetCommand({
            TableName: this.tableName,
            Key: { __id: id }
        })

        const result = await dynamoDBClient.send(command)
        return result.Item as Permission || null
    }

    async getByRoleAndTable(roleId: string, tableName: string): Promise<Permission | null> {
        const id = `${roleId}::${tableName}`
        return this.getById(id)
    }

    async listByRole(roleId: string): Promise<Permission[]> {
        const command = new ScanCommand({
            TableName: this.tableName,
            FilterExpression: 'roleId = :roleId',
            ExpressionAttributeValues: {
                ':roleId': roleId
            }
        })

        const result = await dynamoDBClient.send(command)
        return result.Items as Permission[] || []
    }

    async list(): Promise<Permission[]> {
        const command = new ScanCommand({
            TableName: this.tableName
        })

        const result = await dynamoDBClient.send(command)
        return result.Items as Permission[] || []
    }

    async update(id: string, updates: Partial<Permission>): Promise<Permission> {
        const updateExpressions: string[] = []
        const expressionAttributeValues: any = {}
        const expressionAttributeNames: any = {}

        Object.entries(updates).forEach(([key, value]) => {
            if (key !== '__id' && key !== 'roleId' && key !== 'tableName') {
                updateExpressions.push(`#${key} = :${key}`)
                expressionAttributeValues[`:${key}`] = value
                expressionAttributeNames[`#${key}`] = key
            }
        })

        if (updateExpressions.length === 0) {
            throw new Error('No valid fields to update')
        }

        const command = new UpdateCommand({
            TableName: this.tableName,
            Key: { __id: id },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: 'ALL_NEW'
        })

        const result = await dynamoDBClient.send(command)
        return result.Attributes as Permission
    }

    async delete(id: string): Promise<void> {
        const command = new DeleteCommand({
            TableName: this.tableName,
            Key: { __id: id }
        })

        await dynamoDBClient.send(command)
    }
}
