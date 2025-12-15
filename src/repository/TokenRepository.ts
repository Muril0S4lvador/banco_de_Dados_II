import { GetCommand, PutCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Token, TokenEntity } from '../entity/Token';

/**
 * Repositório para operações de token no DynamoDB
 */
export class TokenRepository {
    private tableName: string = 'Tokens';

    /**
     * Busca um token pelo valor do token usando GSI
     */
    async findToken(token: string): Promise<TokenEntity | null> {
        try {
            const command = new QueryCommand({
                TableName: this.tableName,
                IndexName: 'TokenIndex',
                KeyConditionExpression: '#token = :token',
                ExpressionAttributeNames: {
                    '#token': 'token',
                },
                ExpressionAttributeValues: {
                    ':token': token,
                },
                Limit: 1,
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items || result.Items.length === 0) {
                return null;
            }

            const tokenEntity = TokenEntity.fromDynamoDB(result.Items[0]);

            // Retorna null se o token estiver expirado
            if (tokenEntity.isExpired()) {
                return null;
            }

            return tokenEntity;
        } catch (error) {
            console.error('Error finding token:', error);
            throw error;
        }
    }

    /**
     * Cria um novo token
     */
    async createToken(tokenData: Partial<Token>): Promise<TokenEntity> {
        try {
            const tokenEntity = new TokenEntity(tokenData);

            const command = new PutCommand({
                TableName: this.tableName,
                Item: tokenEntity.toDynamoDB(),
            });

            await dynamoDBClient.send(command);
            return tokenEntity;
        } catch (error) {
            console.error('Error creating token:', error);
            throw error;
        }
    }

    /**
     * Busca um token específico pelo userId e token
     */
    async findTokenByUserIdAndToken(userId: string, token: string): Promise<TokenEntity | null> {
        try {
            const command = new GetCommand({
                TableName: this.tableName,
                Key: {
                    userId: userId,
                    token: token,
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Item) {
                return null;
            }

            const tokenEntity = TokenEntity.fromDynamoDB(result.Item);

            // Retorna null se o token estiver expirado
            if (tokenEntity.isExpired()) {
                return null;
            }

            return tokenEntity;
        } catch (error) {
            console.error('Error finding token by userId and token:', error);
            throw error;
        }
    }

    /**
     * Busca todos os tokens de um usuário
     */
    async findTokensByUserId(userId: string): Promise<TokenEntity[]> {
        try {
            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items || result.Items.length === 0) {
                return [];
            }

            return result.Items
                .map(item => TokenEntity.fromDynamoDB(item))
                .filter(token => !token.isExpired()); // Filtra tokens expirados
        } catch (error) {
            console.error('Error finding tokens by userId:', error);
            throw error;
        }
    }

    /**
     * Deleta um token específico
     */
    async deleteToken(userId: string, token: string): Promise<boolean> {
        try {
            const command = new DeleteCommand({
                TableName: this.tableName,
                Key: {
                    userId: userId,
                    token: token,
                },
            });

            await dynamoDBClient.send(command);
            return true;
        } catch (error) {
            console.error('Error deleting token:', error);
            throw error;
        }
    }

    /**
     * Deleta todos os tokens de um usuário
     */
    async deleteAllTokensByUserId(userId: string): Promise<boolean> {
        try {
            const tokens = await this.findTokensByUserId(userId);

            for (const token of tokens) {
                await this.deleteToken(userId, token.token);
            }

            return true;
        } catch (error) {
            console.error('Error deleting all tokens by userId:', error);
            throw error;
        }
    }

    /**
     * Deleta tokens expirados de um usuário
     */
    async deleteExpiredTokens(userId: string): Promise<number> {
        try {
            const command = new QueryCommand({
                TableName: this.tableName,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {
                    ':userId': userId,
                },
            });

            const result = await dynamoDBClient.send(command);

            if (!result.Items || result.Items.length === 0) {
                return 0;
            }

            const expiredTokens = result.Items
                .map(item => TokenEntity.fromDynamoDB(item))
                .filter(token => token.isExpired());

            for (const token of expiredTokens) {
                await this.deleteToken(userId, token.token);
            }

            return expiredTokens.length;
        } catch (error) {
            console.error('Error deleting expired tokens:', error);
            throw error;
        }
    }
}
