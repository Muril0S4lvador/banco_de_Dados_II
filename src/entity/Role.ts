/**
 * Enum de tipos de roles disponíveis no sistema
 */
export enum RoleType {
    ADMIN = 'ADMIN',
    CUSTOM = 'CUSTOM',
}

/**
 * Interface Role para DynamoDB
 * 
 * Estrutura da tabela:
 * - PK (Partition Key): roleId
 * - GSI1PK: name (para buscar por nome)
 * 
 * Nota: As permissões específicas de cada role são armazenadas
 * na tabela Permissions, vinculadas pelo roleId
 */
export interface Role {
    roleId: string;
    name: string;
    type: RoleType;
    description: string;
    isCustom?: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    entityType: 'ROLE';
}

/**
 * Classe Role com métodos auxiliares
 */
export class RoleEntity implements Role {
    roleId: string;
    name: string;
    type: RoleType;
    description: string;
    isCustom?: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
    entityType: 'ROLE' = 'ROLE';

    constructor(data: Partial<Role>) {
        this.roleId = data.roleId || this.generateId();
        this.name = data.name || '';
        this.type = data.type || RoleType.CUSTOM;
        this.description = data.description || '';
        this.isCustom = data.isCustom || false;
        this.createdBy = data.createdBy;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    private generateId(): string {
        return `role_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Atualiza o timestamp de modificação
     */
    touch(): void {
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Converte para objeto DynamoDB
     */
    toDynamoDB(): Record<string, any> {
        const data: Record<string, any> = {
            roleId: this.roleId,
            name: this.name,
            type: this.type,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            entityType: this.entityType,
        };

        if (this.isCustom !== undefined) {
            data.isCustom = this.isCustom;
        }

        if (this.createdBy) {
            data.createdBy = this.createdBy;
        }

        return data;
    }

    /**
     * Cria instância a partir de dados do DynamoDB
     */
    static fromDynamoDB(data: any): RoleEntity {
        return new RoleEntity(data);
    }

    /**
     * Cria roles padrão do sistema
     */
    static createDefaultRoles(): RoleEntity[] {
        return [
            new RoleEntity({
                name: 'Administrator',
                type: RoleType.ADMIN,
                description: 'Full system access',
                isCustom: false,
            }),
        ];
    }

    /**
     * Cria um novo role customizado
     */
    static createCustomRole(
        name: string,
        description: string,
        createdBy: string
    ): RoleEntity {
        return new RoleEntity({
            name,
            description,
            type: RoleType.CUSTOM,
            isCustom: true,
            createdBy,
        });
    }

    /**
     * Valida se o nome do role é válido
     */
    static validateRoleName(name: string): { valid: boolean; error?: string } {
        if (!name || name.trim().length === 0) {
            return { valid: false, error: 'Role name cannot be empty' };
        }

        if (name.length < 3) {
            return { valid: false, error: 'Role name must be at least 3 characters' };
        }

        if (name.length > 50) {
            return { valid: false, error: 'Role name must be less than 50 characters' };
        }

        if (!/^[a-zA-Z0-9\s_-]+$/.test(name)) {
            return { valid: false, error: 'Role name can only contain letters, numbers, spaces, hyphens and underscores' };
        }

        return { valid: true };
    }

    isAdmin(): boolean {
        return this.type === RoleType.ADMIN;
    }
}
