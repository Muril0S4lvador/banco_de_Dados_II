export class Branch {
    branch_name?: string
    branch_city?: string
    assets?: number
    __id?: string

    constructor(init?: Partial<Branch>) {
        Object.assign(this, init)
    }
}
