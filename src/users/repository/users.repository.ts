import { Pool } from 'pg'
import { User } from '../interface/user'
import { Inject } from '@nestjs/common'
import { PG_CONNECTION } from 'src/database/database.constants'
export class UsersRepository {
    constructor(
        @Inject(PG_CONNECTION)
        private readonly pg: Pool
    ) { }

    async create(name: string, password: string, email: string): Promise<User> {
        const query: string = `
            INSERT INTO users (name, password, email)
            VALUES ($1, $2, $3) 
            RETURNING id, name, email, role, status
         `
        try {
            const result = await this.pg.query<User>(query, [name, password, email]);
            if (result.rowsCount === 0) throw new Error("USER_NOT_FOUND")
            return result.rows[0];
        } catch (e: unknown) {
            if (typeof e === 'object' && e !== null && 'code' in e) {
                switch (e.code) {
                    case '23505':
                        throw new Error('EMAIL_DUPLICATE')
                    case '23502':
                        throw new Error('NAME_OR_PASSWORD_IS_NULL')
                }
            }
            throw new Error('SOMETHING_WHEN_WRONG')
        }
    }

    async findAll(): Promise<User[]> {
        const query: string = `
            SELECT id, name, email, role, status FROM users
            WHERE deleted_at IS NULL
        `
        const result = await this.pg.query<User[]>(query);
        return result.rows
    }

    async findById(id: string): Promise<User> {
        const query: string = `
            SELECT id, name, email, role, status
            FROM users
            WHERE id = $1
            RETURNING id, name, email, role, status
        `
        const result = await this.pg.query<User>(query, [id])
        if (result.rows.length === 0) throw new Error("USER_NOT_FOUND")
        return result.rows[0]
    }

    async findByEmail(email: string): Promise<User> {
        const query: string = `
            SELECT password
            FROM users
            WHERE email = $1
        `
        const result = await this.pg.query(query, [email])
        if (result.rows.length === 0) throw new Error('USER_NOT_FOUND')
        return result.rows[0]
    }

    async update(id: string, update: Partial<Omit<User, 'id' | 'name'>>): Promise<User> {
        const entries = Object.entries(update)
        const setClause = entries
            .map(([key], index) => `${key} = $${index + 1}`)
            .join(', ')
        const values = entries.map(([, value]) => value)
        const query = `
            UPDATE users
            SET ${setClause}
            WHERE id = $${values.length + 1}
            RETURNING id, name, email, role, status
        `
        const result = await this.pg.query(query, [
            ...values,
            id
        ])
        if (result.rows.length === 0) throw new Error('USER_NOT_FOUND')
        return result.rows[0]
    }

    async softDelete(id: string): Promise<boolean> {
        const query = `
            UPDATE users
            SET deleted_at = NOW()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING id `
        const result = await this.pg.query(query, [id])
        if (result.rowCount === 1) {
            return true
        } else {
            throw new Error('USER_NOT_FOUND')
        }
    }
}