import api from '../lib/axios';

export interface Account {
    account_number: string;
    branch_name: string;
    balance: number;
    __id: string;
}

export const accountService = {
    async list(): Promise<Account[]> {
        const response = await api.get('/account');
        return response.data.data;
    },

    async get(accountNumber: string): Promise<Account> {
        const response = await api.get(`/account/${accountNumber}`);
        return response.data.data;
    },

    async create(account: Omit<Account, '__id'>): Promise<Account> {
        const response = await api.post('/account', account);
        return response.data.data;
    },

    async update(accountNumber: string, account: Partial<Account>): Promise<Account> {
        const response = await api.put(`/account/${accountNumber}`, account);
        return response.data.data;
    },

    async delete(accountNumber: string): Promise<void> {
        await api.delete(`/account/${accountNumber}`);
    }
};
