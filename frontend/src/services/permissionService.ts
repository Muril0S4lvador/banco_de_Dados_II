import api from '../lib/axios'

export interface TablePermissions {
    allowedView: boolean
    allowedEdit: boolean
    allowedDelete: boolean
}

export type UserPermissions = Record<string, TablePermissions>

export const permissionService = {
    async getMyPermissions(): Promise<UserPermissions> {
        const response = await api.get('/user/permissions')
        return response.data.data
    }
}
