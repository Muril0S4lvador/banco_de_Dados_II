export class Borrower {
    customer_name?: string
    loan_number?: string
    __id?: string

    constructor(init?: Partial<Borrower>) {
        Object.assign(this, init)
    }
}
