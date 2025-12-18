export class Depositor {
    customer_name?: string
    account_number?: string
    __id?: string

    constructor(init?: Partial<Depositor>) {
        Object.assign(this, init)
    }
}
