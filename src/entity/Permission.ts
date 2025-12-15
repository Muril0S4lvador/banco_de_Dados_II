/**
 * Interface Permission para DynamoDB
 * 
 * Estrutura da tabela:
 * - PK (Partition Key): permissionId
 * - SK (Sort Key): roleId#tableName
 * - GSI1PK: roleId (para buscar todas as permissões de um role)
 * - GSI1SK: tableName
 * - GSI2PK: userId (para buscar todas as permissões de um usuário)
 * - GSI2SK: tableName
 */
export interface Permission {
    permissionId: string;
    userId: string;
    roleId: string;
    allowedView: boolean;
    allowedEdit: boolean;
    allowedDelete: boolean;
    tableName: string;
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
    entityType: 'PERMISSION';
}

/**
 * Classe Permission com métodos auxiliares
 */
export class PermissionEntity implements Permission {
    permissionId: string;
    userId: string;
    roleId: string;
    allowedView: boolean;
    allowedEdit: boolean;
    allowedDelete: boolean;
    tableName: string;
    createdAt: string;
    updatedAt: string;
    entityType: 'PERMISSION' = 'PERMISSION';

    constructor(data: Partial<Permission>) {
        this.permissionId = data.permissionId || this.generateId();
        this.userId = data.userId || '';
        this.roleId = data.roleId || '';
        this.allowedView = data.allowedView ?? false;
        this.allowedEdit = data.allowedEdit ?? false;
        this.allowedDelete = data.allowedDelete ?? false;
        this.tableName = data.tableName || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    private generateId(): string {
        return `perm_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    }

    /**
     * Atualiza o timestamp de modificação
     */
    touch(): void {
        this.updatedAt = new Date().toISOString();
    }

    /**
     * Concede permissão de visualização
     */
    grantView(): void {
        this.allowedView = true;
        this.touch();
    }

    /**
     * Revoga permissão de visualização
     */
    revokeView(): void {
        this.allowedView = false;
        this.touch();
    }

    /**
     * Concede permissão de edição
     */
    grantEdit(): void {
        this.allowedEdit = true;
        this.touch();
    }

    /**
     * Revoga permissão de edição
     */
    revokeEdit(): void {
        this.allowedEdit = false;
        this.touch();
    }

    /**
     * Concede permissão de exclusão
     */
    grantDelete(): void {
        this.allowedDelete = true;
        this.touch();
    }

    /**
     * Revoga permissão de exclusão
     */
    revokeDelete(): void {
        this.allowedDelete = false;
        this.touch();
    }

    /**
     * Concede todas as permissões
     */
    grantAll(): void {
        this.allowedView = true;
        this.allowedEdit = true;
        this.allowedDelete = true;
        this.touch();
    }

    /**
     * Revoga todas as permissões
     */
    revokeAll(): void {
        this.allowedView = false;
        this.allowedEdit = false;
        this.allowedDelete = false;
        this.touch();
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
     * Converte para objeto DynamoDB
     */
    toDynamoDB(): Record<string, any> {
        return {
            permissionId: this.permissionId,
            userId: this.userId,
            roleId: this.roleId,
            allowedView: this.allowedView,
            allowedEdit: this.allowedEdit,
            allowedDelete: this.allowedDelete,
            tableName: this.tableName,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            entityType: this.entityType,
        };
    }

    /**
     * Cria instância a partir de dados do DynamoDB
     */
    static fromDynamoDB(data: any): PermissionEntity {
        return new PermissionEntity(data);
    }

    /**
     * Cria uma nova permissão
     */
    static createPermission(
        userId: string,
        roleId: string,
        tableName: string,
        allowedView: boolean = false,
        allowedEdit: boolean = false,
        allowedDelete: boolean = false
    ): PermissionEntity {
        return new PermissionEntity({
            userId,
            roleId,
            tableName,
            allowedView,
            allowedEdit,
            allowedDelete,
        });
    }

    /**
     * Valida se a permissão é válida
     */
    static validate(permission: Partial<Permission>): { valid: boolean; error?: string } {
        if (!permission.userId || permission.userId.trim().length === 0) {
            return { valid: false, error: 'userId is required' };
        }

        if (!permission.roleId || permission.roleId.trim().length === 0) {
            return { valid: false, error: 'roleId is required' };
        }

        if (!permission.tableName || permission.tableName.trim().length === 0) {
            return { valid: false, error: 'tableName is required' };
        }

        return { valid: true };
    }
}