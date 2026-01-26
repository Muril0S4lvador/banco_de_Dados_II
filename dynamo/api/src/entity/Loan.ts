export class Loan {
    loan_number?: string // PK
    branch_name?: string // FK
    amount?: number

    constructor(init?: Partial<Loan>) {
        Object.assign(this, init)
    }
}
