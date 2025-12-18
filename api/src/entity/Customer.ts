export class Customer {
    customer_name?: string
    customer_street?: string
    customer_city?: string
    __id?: string

    constructor(init?: Partial<Customer>) {
        Object.assign(this, init)
    }
}
