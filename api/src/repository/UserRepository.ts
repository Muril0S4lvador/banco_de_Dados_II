import { GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { User, UserEntity } from '../entity/User';

/**
 * Repositório para operações de usuário no DynamoDB
 */
export class UserRepository {
    private tableName: string = 'Users';

    /**
     * Busca um usuário pelo userId
     */
    async findUserByUserId(userId: string): Promise<UserEntity | null> {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    userId: userId,
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Item) {
                return null;
            }

            return UserEntity.fromDynamoDB(result.Item);
        } catch (error) {
            console.error('Error finding user by userId:', error);
            throw error;
        }
    }

    /**
     * Busca um usuário pelo username usando GSI
     */
    async findUserByUsername(username: string): Promise<UserEntity | null> {
        try {
            const command = new QueryCommand({
                TableName: this.tableName,
                IndexName: 'UsernameIndex',
                KeyConditionExpression: 'username = :username',
                ExpressionAttributeValues: {
                    ':username': username,
                },
                Limit: 1,
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items || result.Items.length === 0) {
                return null;
            }

            return UserEntity.fromDynamoDB(result.Items[0]);
        } catch (error) {
            console.error('Error finding user by username:', error);
            throw error;
        }
    }

    /**
     * Cria um novo usuário
     */
    async createUser(user: UserEntity): Promise<UserEntity> {
        try {
            const command = new PutCommand({
                TableName: this.tableName,
                Item: user.toDynamoDB(),
                ConditionExpression: 'attribute_not_exists(userId)', // Garante que não sobrescreva
            });

            await dynamoDBClient.send(command);
            return user;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    /**
     * Atualiza um usuário existente
     */
    async updateUser(user: UserEntity): Promise<UserEntity> {
        try {
            user.touch(); // Atualiza o timestamp

            const command = new PutCommand({
                TableName: this.tableName,
                Item: user.toDynamoDB(),
            });

            await dynamoDBClient.send(command);
            return user;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    /**
     * Deleta um usuário pelo userId
     */
    async deleteUser(userId: string): Promise<boolean> {
        try {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: {
                    userId: userId,
                },
            });

            await dynamoDBClient.send(command);
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    /**
     * Lista todos os usuários
     */
    async listAllUsers(): Promise<UserEntity[]> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                FilterExpression: 'entityType = :entityType',
                ExpressionAttributeValues: {
                    ':entityType': 'USER',
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items || result.Items.length === 0) {
                return [];
            }

            return result.Items.map(item => UserEntity.fromDynamoDB(item));
        } catch (error) {
            console.error('Error listing users:', error);
            throw error;
        }
    }

    /**
     * Busca usuários por role
     */
    async findUsersByRole(roleId: string): Promise<UserEntity[]> {
        try {
            const command = new ScanCommand({
                TableName: this.tableName,
                FilterExpression: 'contains(roleIds, :roleId)',
                ExpressionAttributeValues: {
                    ':roleId': roleId,
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items || result.Items.length === 0) {
                return [];
            }

            return result.Items.map(item => UserEntity.fromDynamoDB(item));
        } catch (error) {
            console.error('Error finding users by role:', error);
            throw error;
        }
    }
}
