export class Customer {
    customer_name?: string  // PK
    customer_street?: string
    customer_city?: string

    constructor(init?: Partial<Customer>) {
        Object.assign(this, init)
    }
}
