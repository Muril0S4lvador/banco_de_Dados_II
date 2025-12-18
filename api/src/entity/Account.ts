export class Account {
    account_number?: string
    branch_name?: string
    balance?: number
    __id?: string

    constructor(init?: Partial<Account>) {
        Object.assign(this, init)
    }
}
