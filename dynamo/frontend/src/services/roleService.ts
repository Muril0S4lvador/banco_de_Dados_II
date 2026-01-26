import api from '../lib/axios'

export interface Role {
    roleId: string
    name: string
    description?: string
    permissions?: any[]
    createdAt?: string
    updatedAt?: string
}

export const roleService = {
    // Listar todas as roles
    async listRoles(): Promise<Role[]> {
        const response = await api.get('/role')
        return response.data.data
    },

    // Buscar role por ID
    async getRole(roleId: string): Promise<Role> {
        const response = await api.get(`/role/${roleId}`)
        return response.data.data
    },
}
