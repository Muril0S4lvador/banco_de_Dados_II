/**
 * Interface UserRole para DynamoDB (Tabela de relacionamento Many-to-Many)
 * 
 * Estrutura da tabela:
 * - PK (Partition Key): userId
 * - SK (Sort Key): ROLE#{roleId}
 * - GSI1PK: roleId (para buscar todos usuários de um role)
 * - GSI1SK: userId
 */
export interface UserRole {
    /**
     * Partition Key - ID do usuário
     */
    userId: string;

    /**
     * Sort Key - ID do role
     */
    roleId: string;

    /**
     * Data em que o role foi atribuído ao usuário
     */
    assignedAt: string;

    /**
     * Quem atribuiu o role (userId do admin)
     */
    assignedBy?: string;

    /**
     * Data de expiração do role (opcional)
     */
    expiresAt?: string;

    /**
     * Status do relacionamento
     */
    isActive: boolean;

    /**
     * Tipo de entidade
     */
    entityType: 'USER_ROLE';
}

/**
 * Classe UserRole com métodos auxiliares
 */
export class UserRoleEntity implements UserRole {
    userId: string;
    roleId: string;
    assignedAt: string;
    assignedBy?: string;
    expiresAt?: string;
    isActive: boolean;
    entityType: 'USER_ROLE' = 'USER_ROLE';

    constructor(data: Partial<UserRole>) {
        this.userId = data.userId || '';
        this.roleId = data.roleId || '';
        this.assignedAt = data.assignedAt || new Date().toISOString();
        this.assignedBy = data.assignedBy;
        this.expiresAt = data.expiresAt;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
    }

    /**
     * Verifica se o role expirou
     */
    isExpired(): boolean {
        if (!this.expiresAt) return false;
        return new Date(this.expiresAt) < new Date();
    }

    /**
     * Verifica se o role está válido
     */
    isValid(): boolean {
        return this.isActive && !this.isExpired();
    }

    /**
     * Desativa o role
     */
    deactivate(): void {
        this.isActive = false;
    }

    /**
     * Ativa o role
     */
    activate(): void {
        this.isActive = true;
    }

    /**
     * Converte para objeto DynamoDB
     */
    toDynamoDB(): Record<string, any> {
        const data: Record<string, any> = {
            userId: this.userId,
            roleId: this.roleId,
            assignedAt: this.assignedAt,
            isActive: this.isActive,
            entityType: this.entityType,
        };

        if (this.assignedBy) {
            data.assignedBy = this.assignedBy;
        }

        if (this.expiresAt) {
            data.expiresAt = this.expiresAt;
        }

        return data;
    }

    /**
     * Cria instância a partir de dados do DynamoDB
     */
    static fromDynamoDB(data: any): UserRoleEntity {
        return new UserRoleEntity(data);
    }
}
