export enum Role {
    admin = 'admin',
    user = 'user'
}

export enum Status {
    active = 'active',
    inactive = 'inactive',
    banned = 'banned'
}

export interface User {
    readonly id: string,
    name: string,
    email: string,
    role: Role,
    password: string,
    status: Status,
}