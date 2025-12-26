import { GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Role, RoleEntity } from '../entity/Role';

/**
 * Repositório para operações de roles no DynamoDB
 */
export class RoleRepository {
    private tableName: string = 'Roles';

    /**
     * Busca uma role pelo roleId
     */
    async findRoleByRoleId(roleId: string): Promise<RoleEntity | null> {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    roleId: roleId,
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Item) {
                return null;
            }

            return RoleEntity.fromDynamoDB(result.Item);
        } catch (error) {
            console.error('Error finding role by roleId:', error);
            throw error;
        }
    }

    /**
     * Busca uma role pelo nome usando Scan (sem GSI)
     */
    async findRoleByName(name: string): Promise<RoleEntity | null> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                FilterExpression: '#name = :name AND entityType = :entityType',
                ExpressionAttributeNames: {
                    '#name': 'name',
                },
                ExpressionAttributeValues: {
                    ':name': name,
                    ':entityType': 'ROLE',
                },
                Limit: 1,
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items || result.Items.length === 0) {
                return null;
            }

            return RoleEntity.fromDynamoDB(result.Items[0]);
        } catch (error) {
            console.error('Error finding role by name:', error);
            throw error;
        }
    }

    /**
     * Cria uma nova role
     */
    async createRole(role: RoleEntity): Promise<RoleEntity> {
        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: role.toDynamoDB(),
                ConditionExpression: 'attribute_not_exists(roleId)', // Garante que não sobrescreva
            });

            await dynamoDBClient.send(command);
            return role;
        } catch (error) {
            console.error('Error creating role:', error);
            throw error;
        }
    }

    /**
     * Atualiza uma role existente
     */
    async updateRole(role: RoleEntity): Promise<RoleEntity> {
        try {
            role.touch(); // Atualiza o timestamp

            const command = new PutCommand({
                TableName: this.tableName,
                Item: role.toDynamoDB(),
            });

            await dynamoDBClient.send(command);
            return role;
        } catch (error) {
            console.error('Error updating role:', error);
            throw error;
        }
    }

    /**
     * Deleta uma role
     */
    async deleteRole(roleId: string): Promise<void> {
        try {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: {
                    roleId: roleId,
                },
            });

            await dynamoDBClient.send(command);
        } catch (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    }

    /**
     * Lista todas as roles
     */
    async listAllRoles(): Promise<RoleEntity[]> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                FilterExpression: 'entityType = :entityType',
                ExpressionAttributeValues: {
                    ':entityType': 'ROLE',
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => RoleEntity.fromDynamoDB(item));
        } catch (error) {
            console.error('Error listing all roles:', error);
            throw error;
        }
    }

    /**
     * Lista apenas roles customizadas
     */
    async listCustomRoles(): Promise<RoleEntity[]> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                FilterExpression: 'entityType = :entityType AND isCustom = :isCustom',
                ExpressionAttributeValues: {
                    ':entityType': 'ROLE',
                    ':isCustom': true,
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items) {
                return [];
            }

            return result.Items.map(item => RoleEntity.fromDynamoDB(item));
        } catch (error) {
            console.error('Error listing custom roles:', error);
            throw error;
        }
    }

    /**
     * Verifica se uma role com determinado nome já existe
     */
    async roleNameExists(name: string, excludeRoleId?: string): Promise<boolean> {
        const existingRole = await this.findRoleByName(name);

        if (!existingRole) {
            return false;
        }

        // Se está excluindo um roleId específico (para updates), verifica se é outro role
        if (excludeRoleId && existingRole.roleId === excludeRoleId) {
            return false;
        }

        return true;
    }
}
