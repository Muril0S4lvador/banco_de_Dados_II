export class Account {
    account_number?: string // PK
    branch_name?: string // FK
    balance?: number

    constructor(init?: Partial<Account>) {
        Object.assign(this, init)
    }
}
