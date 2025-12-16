/**
 * Interface User para DynamoDB
 * 
 * Estrutura da tabela:
 * - PK (Partition Key): userId
 * - SK (Sort Key): USER#{userId}
 * - GSI1PK: username (para buscar por username)
 * - GSI1SK: entityType
 */

export interface User {
    /**
     * Partition Key e Sort Key - ID único do usuário
     */
    userId: string;

    /**
     * Username
     */
    username: string;

    /**
     * Nome do usuário
     */
    name: string;

    /**
     * Senha hash
     */
    password: string;

    /**
     * IDs dos roles do usuário (armazenado como lista)
     */
    roleIds?: string[];

    /**
     * Data de criação
     */
    createdAt: string; // ISO 8601 date string

    /**
     * Data de atualização
     */
    updatedAt: string; // ISO 8601 date string

    /**
     * Tipo de entidade
     */
    entityType: 'USER';
}

/**
 * Classe User com métodos auxiliares
 */
export class UserEntity implements User {
    userId: string;
    username: string;
    name: string;
    password: string;
    roleIds?: string[];
    createdAt: string;
    updatedAt: string;
    entityType: 'USER' = 'USER';

    constructor(data: Partial<User>) {
        this.userId = data.userId || this.generateId();
        this.username = data.username || '';
        this.name = data.name || '';
        this.password = data.password || '';
        this.roleIds = data.roleIds || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    private generateId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Atualiza o timestamp de modificação
     */
    touch(): void {
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Adiciona um role ao usuário
     */
    addRole(roleId: string): void {
        if (!this.roleIds) {
            this.roleIds = [];
        }
        if (!this.roleIds.includes(roleId)) {
            this.roleIds.push(roleId);
            this.touch();
        }
    }

    /**
     * Remove um role do usuário
     */
    removeRole(roleId: string): void {
        if (this.roleIds) {
            this.roleIds = this.roleIds.filter(id => id !== roleId);
            this.touch();
        }
    }

    /**
     * Verifica se o usuário possui um role específico
     */
    hasRole(roleId: string): boolean {
        return this.roleIds ? this.roleIds.includes(roleId) : false;
    }

    /**
     * Converte para objeto DynamoDB
     */
    toDynamoDB(): Record<string, any> {
        return {
            userId: this.userId,
            username: this.username,
            name: this.name,
            password: this.password,
            roleIds: this.roleIds || [],
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            entityType: this.entityType,
        };
    }

    /**
     * Converte para objeto público (sem senha)
     */
    toPublic(): Omit<User, 'password'> {
        return {
            userId: this.userId,
            username: this.username,
            name: this.name,
            roleIds: this.roleIds,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            entityType: this.entityType,
        };
    }

    /**
     * Cria instância a partir de dados do DynamoDB
     */
    static fromDynamoDB(data: any): UserEntity {
        return new UserEntity(data);
    }
}
