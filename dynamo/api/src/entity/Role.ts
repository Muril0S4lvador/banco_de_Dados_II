/**
 * Enum de tipos de roles disponíveis no sistema
 */
export enum RoleType {
    ADMIN = 'ADMIN',
    CUSTOM = 'CUSTOM',
}

/**
 * Interface para permissões por tabela
 * Representa o que uma role pode fazer em uma tabela específica
 */
export interface RolePermission {
    tableName: string;
    allowedView: boolean;      // select - visualizar dados
    allowedEdit: boolean;      // insert - adicionar e atualizar valores
    allowedDelete: boolean;    // delete - deletar itens e a própria tabela
}

/**
 * Classe auxiliar para permissões por tabela
 */
export class RolePermissionEntity implements RolePermission {
    tableName: string;
    allowedView: boolean;
    allowedEdit: boolean;
    allowedDelete: boolean;

    constructor(data: Partial<RolePermission>) {
        this.tableName = data.tableName || '';
        this.allowedView = data.allowedView ?? false;
        this.allowedEdit = data.allowedEdit ?? false;
        this.allowedDelete = data.allowedDelete ?? false;
    }

    /**
     * Verifica se tem alguma permissão ativa
     */
    hasAnyPermission(): boolean {
        return this.allowedView || this.allowedEdit || this.allowedDelete;
    }

    /**
     * Verifica se tem permissão total (todas as ações permitidas)
     */
    hasFullPermission(): boolean {
        return this.allowedView && this.allowedEdit && this.allowedDelete;
    }

    /**
     * Converte para objeto simples
     */
    toObject(): RolePermission {
        return {
            tableName: this.tableName,
            allowedView: this.allowedView,
            allowedEdit: this.allowedEdit,
            allowedDelete: this.allowedDelete,
        };
    }

    /**
     * Cria instância a partir de dados
     */
    static fromObject(data: any): RolePermissionEntity {
        return new RolePermissionEntity(data);
    }
}

/**
 * Interface Role para DynamoDB
 * 
 * Estrutura da tabela:
 * - PK (Partition Key): roleId
 * - GSI1PK: name (para buscar por nome)
 * 
 * Nota: As permissões são armazenadas como array dentro da própria role
 */
export interface Role {
    roleId: string;
    name: string;
    type: RoleType;
    description: string;
    permissions: RolePermission[]; // Array de permissões por tabela
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
    permissions: RolePermission[];
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
        this.permissions = data.permissions || [];
        this.isCustom = data.isCustom ?? true; // Por padrão é custom
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
            permissions: this.permissions, // DynamoDB suporta arrays nativamente
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
                permissions: [], // Admin tem acesso total implícito
            }),
        ];
    }

    /**
     * Cria um novo role customizado com permissões
     */
    static createCustomRole(
        name: string,
        description: string,
        permissions: RolePermission[],
        createdBy?: string
    ): RoleEntity {
        return new RoleEntity({
            name,
            description,
            permissions,
            type: RoleType.CUSTOM,
            isCustom: true,
            createdBy,
        });
    }

    /**
     * Adiciona uma permissão à role
     */
    addPermission(permission: RolePermission): void {
        // Remove permissão existente para a mesma tabela
        this.permissions = this.permissions.filter(p => p.tableName !== permission.tableName);
        // Adiciona nova permissão
        this.permissions.push(permission);
        this.touch();
    }

    /**
     * Remove permissão de uma tabela
     */
    removePermission(tableName: string): void {
        this.permissions = this.permissions.filter(p => p.tableName !== tableName);
        this.touch();
    }

    /**
     * Busca permissão para uma tabela específica
     */
    getPermissionForTable(tableName: string): RolePermission | undefined {
        return this.permissions.find(p => p.tableName === tableName);
    }

    /**
     * Verifica se tem permissão de visualização para uma tabela
     */
    canView(tableName: string): boolean {
        if (this.isAdmin()) return true;
        const permission = this.getPermissionForTable(tableName);
        return permission?.allowedView ?? false;
    }

    /**
     * Verifica se tem permissão de edição para uma tabela
     */
    canEdit(tableName: string): boolean {
        if (this.isAdmin()) return true;
        const permission = this.getPermissionForTable(tableName);
        return permission?.allowedEdit ?? false;
    }

    /**
     * Verifica se tem permissão de deleção para uma tabela
     */
    canDelete(tableName: string): boolean {
        if (this.isAdmin()) return true;
        const permission = this.getPermissionForTable(tableName);
        return permission?.allowedDelete ?? false;
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
