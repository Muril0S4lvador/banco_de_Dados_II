import api from '../lib/axios';

export interface Customer {
    customer_name: string;
    customer_street: string;
    customer_city: string;
    __id: string;
}

export const customerService = {
    async list(): Promise<Customer[]> {
        const response = await api.get('/customer');
        return response.data.data;
    },

    async get(customerName: string): Promise<Customer> {
        const response = await api.get(`/customer/${customerName}`);
        return response.data.data;
    },

    async create(customer: Omit<Customer, '__id'>): Promise<Customer> {
        const response = await api.post('/customer', customer);
        return response.data.data;
    },

    async update(customerName: string, customer: Partial<Customer>): Promise<Customer> {
        const response = await api.put(`/customer/${customerName}`, customer);
        return response.data.data;
    },

    async delete(customerName: string): Promise<void> {
        await api.delete(`/customer/${customerName}`);
    }
};
