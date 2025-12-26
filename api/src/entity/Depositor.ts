export class Depositor {
    customer_name?: string  // FK
    account_number?: string // FK
    id?: string // PK 

    constructor(init?: Partial<Depositor>) {
        Object.assign(this, init)
    }
}
