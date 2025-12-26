export class Borrower {
    customer_name?: string //FK
    loan_number?: string // FK 
    id?: string // PK 

    constructor(init?: Partial<Borrower>) {
        Object.assign(this, init)
    }
}
