import api from '../lib/axios';

export interface Borrower {
    id?: string;
    customer_name: string;
    loan_number: string;
    __id: string;
}

export const borrowerService = {
    async list(): Promise<Borrower[]> {
        const response = await api.get('/borrower');
        return response.data.data;
    },

    async get(id: string): Promise<Borrower> {
        const response = await api.get(`/borrower/${id}`);
        return response.data.data;
    },

    async create(borrower: Omit<Borrower, '__id' | 'id'>): Promise<Borrower> {
        const response = await api.post('/borrower', borrower);
        return response.data.data;
    },

    async update(id: string, borrower: Partial<Borrower>): Promise<Borrower> {
        const response = await api.put(`/borrower/${id}`, borrower);
        return response.data.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/borrower/${id}`);
    }
};
