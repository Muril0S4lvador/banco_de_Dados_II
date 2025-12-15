/**
 * Interface Token para DynamoDB
 * 
 * Estrutura da tabela:
 * - PK (Partition Key): userId
 * - SK (Sort Key): token
 * - GSI1PK: token (para buscar por token)
 * - GSI1SK: expiresAt (para queries por data de expiração)
 */

export interface Token {
    /**
     * Partition Key - ID do usuário
     */
    userId: string;

    /**
     * Sort Key - Token único
     */
    token: string;

    /**
     * ID único do token (UUID)
     */
    id: string;

    /**
     * Data de expiração do token
     */
    expiresAt: string; // ISO 8601 date string

    /**
     * Data de criação
     */
    createdAt: string; // ISO 8601 date string

    /**
     * Tipo de entidade para facilitar queries
     */
    entityType: 'TOKEN';
}

/**
 * Classe Token com métodos auxiliares
 */
export class TokenEntity implements Token {
    userId: string;
    token: string;
    id: string;
    expiresAt: string;
    createdAt: string;
    entityType: 'TOKEN' = 'TOKEN';

    constructor(data: Partial<Token>) {
        this.userId = data.userId || '';
        this.token = data.token || '';
        this.id = data.id || this.generateId();
        this.expiresAt = data.expiresAt || this.getDefaultExpiration();
        this.createdAt = data.createdAt || new Date().toISOString();
    }

    private generateId(): string {
        return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    private getDefaultExpiration(): string {
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24); // 24 horas
        return expirationDate.toISOString();
    }

    /**
     * Verifica se o token expirou
     */
    isExpired(): boolean {
        return new Date(this.expiresAt) < new Date();
    }

    /**
     * Converte para objeto DynamoDB
     */
    toDynamoDB(): Record<string, any> {
        return {
            userId: this.userId,
            token: this.token,
            id: this.id,
            expiresAt: this.expiresAt,
            createdAt: this.createdAt,
            entityType: this.entityType,
        };
    }

    /**
     * Cria instância a partir de dados do DynamoDB
     */
    static fromDynamoDB(data: any): TokenEntity {
        return new TokenEntity(data);
    }
}