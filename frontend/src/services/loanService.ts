import api from '../lib/axios';

export interface Loan {
    loan_number: string;
    branch_name: string;
    amount: number;
    __id: string;
}

export const loanService = {
    async list(): Promise<Loan[]> {
        const response = await api.get('/loan');
        return response.data.data;
    },

    async get(loanNumber: string): Promise<Loan> {
        const response = await api.get(`/loan/${loanNumber}`);
        return response.data.data;
    },

    async create(loan: Omit<Loan, '__id'>): Promise<Loan> {
        const response = await api.post('/loan', loan);
        return response.data.data;
    },

    async update(loanNumber: string, loan: Partial<Loan>): Promise<Loan> {
        const response = await api.put(`/loan/${loanNumber}`, loan);
        return response.data.data;
    },

    async delete(loanNumber: string): Promise<void> {
        await api.delete(`/loan/${loanNumber}`);
    }
};
