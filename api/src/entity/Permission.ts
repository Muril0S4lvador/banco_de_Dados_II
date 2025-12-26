export interface Permission {
    roleId: string
    tableName: string
    allowedView: boolean
    allowedEdit: boolean
    allowedDelete: boolean
    __id?: string
}
