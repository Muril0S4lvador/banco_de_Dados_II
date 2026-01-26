import api from '../lib/axios';

export interface Branch {
    branch_name: string;
    branch_city: string;
    assets: number;
    __id: string;
}

export const branchService = {
    async list(): Promise<Branch[]> {
        const response = await api.get('/branch');
        return response.data.data;
    },

    async get(branchName: string): Promise<Branch> {
        const response = await api.get(`/branch/${branchName}`);
        return response.data.data;
    },

    async create(branch: Omit<Branch, '__id'>): Promise<Branch> {
        const response = await api.post('/branch', branch);
        return response.data.data;
    },

    async update(branchName: string, branch: Partial<Branch>): Promise<Branch> {
        const response = await api.put(`/branch/${branchName}`, branch);
        return response.data.data;
    },

    async delete(branchName: string): Promise<void> {
        await api.delete(`/branch/${branchName}`);
    }
};
