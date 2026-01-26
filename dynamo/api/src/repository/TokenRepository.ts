import { GetCommand, PutCommand, DeleteCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDBClient } from '../config/database';
import { Token, TokenEntity } from '../entity/Token';

/**
 * Repositório para operações de token no DynamoDB
 */
export class TokenRepository {
    private tableName: string = 'Tokens';

    private buildItemId(item: Record<string, any>): string {
        const userId = item.userId ?? '';
        const token = item.token ?? '';
        return [userId, token].filter(Boolean).join('::');
    }

    private buildKeyFromItemId(itemId: string): { userId: string; token: string } {
        const [userId, token] = itemId.split('::');
        return { userId, token };
    }

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
     * Lista todos os tokens (scan)
     */
    async list(): Promise<Array<Token & { __id: string }>> {
        const command = new ScanCommand({ TableName: this.tableName });

        const result = await dynamoDBClient.send(command);
        const items = result.Items || [];
        return items.map(item => ({ ...(item as Token), __id: this.buildItemId(item) }));
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
     * Cria token em modo CRUD comum
     */
    async create(itemData: Partial<Token>): Promise<Token & { __id: string }> {
        const tokenEntity = await this.createToken(itemData);
        return { ...tokenEntity, __id: this.buildItemId(tokenEntity) } as Token & { __id: string };
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
     * Busca token pelo itemId (userId::token)
     */
    async getById(itemId: string): Promise<(Token & { __id: string }) | null> {
        const { userId, token } = this.buildKeyFromItemId(itemId);
        const found = await this.findTokenByUserIdAndToken(userId, token);
        if (!found) return null;
        return { ...found, __id: this.buildItemId(found) } as Token & { __id: string };
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
     * Deleta token pelo itemId (userId::token)
     */
    async deleteById(itemId: string): Promise<boolean> {
        const { userId, token } = this.buildKeyFromItemId(itemId);
        return this.deleteToken(userId, token);
    }

    /**
     * Atualiza token (sobrescreve) pelo itemId
     */
    async update(itemId: string, itemData: Partial<Token>): Promise<Token & { __id: string }> {
        const { userId, token } = this.buildKeyFromItemId(itemId);
        const merged = new TokenEntity({ userId, token, ...itemData });

        const command = new PutCommand({
            TableName: this.tableName,
            Item: merged.toDynamoDB(),
        });

        await dynamoDBClient.send(command);
        return { ...merged, __id: this.buildItemId(merged) } as Token & { __id: string };
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
