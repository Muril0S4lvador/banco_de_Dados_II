import api from '../lib/axios'

export interface User {
    userId: string
    username: string
    name: string
    roleIds: string[]
    createdAt: string
    updatedAt?: string
    entityType?: string
    userType?: 'admin' | 'user'
}

export interface CreateUserData {
    username: string
    name: string
    password: string
    roleIds: string[]
}

export interface UpdateUserData {
    username?: string
    name?: string
    roleIds?: string[]
}

export interface ChangePasswordData {
    newPassword: string
}

export const userService = {
    // Criar usuário
    async createUser(data: CreateUserData): Promise<User> {
        const response = await api.post('/user', data)
        return response.data.data
    },

    // Listar todos os usuários
    async listUsers(): Promise<User[]> {
        const response = await api.get('/user')
        return response.data.data
    },

    // Buscar usuário por ID
    async getUser(userId: string): Promise<User> {
        const response = await api.get(`/user/${userId}`)
        return response.data.data
    },

    // Atualizar usuário
    async updateUser(userId: string, data: UpdateUserData): Promise<User> {
        const response = await api.put(`/user/${userId}`, data)
        return response.data.data
    },

    // Alterar senha
    async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
        await api.put(`/user/${userId}/password`, data)
    },

    // Deletar usuário
    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/user/${userId}`)
    },
}
