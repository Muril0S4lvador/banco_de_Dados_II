export class Loan {
    loan_number?: string
    branch_name?: string
    amount?: number
    __id?: string

    constructor(init?: Partial<Loan>) {
        Object.assign(this, init)
    }
}
