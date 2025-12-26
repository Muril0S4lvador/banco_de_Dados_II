import api from '../lib/axios';

export interface Depositor {
    customer_name: string;
    account_number: string;
    __id: string;
}

export const depositorService = {
    async list(): Promise<Depositor[]> {
        const response = await api.get('/depositor');
        return response.data.data;
    },

    async get(id: string): Promise<Depositor> {
        const response = await api.get(`/depositor/${id}`);
        return response.data.data;
    },

    async create(depositor: Omit<Depositor, '__id'>): Promise<Depositor> {
        const response = await api.post('/depositor', depositor);
        return response.data.data;
    },

    async update(id: string, depositor: Partial<Depositor>): Promise<Depositor> {
        const response = await api.put(`/depositor/${id}`, depositor);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/depositor/${id}`);
    }
};
