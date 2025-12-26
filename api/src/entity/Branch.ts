export class Branch {
    branch_name?: string // PK
    branch_city?: string
    assets?: number

    constructor(init?: Partial<Branch>) {
        Object.assign(this, init)
    }
}
