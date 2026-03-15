import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../infrasturcture/repositories/users.repository';
import { User } from '../domain/entities/user';
@Injectable()
export class UsersService {
    constructor(
        private readonly usersRepository: UsersRepository
    ) { }

    async getUsers(): Promise<Omit<User, 'password'>[]> {
        return this.usersRepository.findAll()
    }

    async getUsersById(id: string): Promise<Omit<User, 'password'>> {
        const user = await this.usersRepository.findById(id)
        if (!user) throw new NotFoundException('USER_NOT_FOUND')
        return user
    }

    /* 
     Object.fromEntries => mengubah aray dari key-value pair ke Object
     Object.entries => mengubah object menjadi array yang terdiri dari key-value pair
     Object.keys => mengubah keys object menjadi array key
     Object.values => mengubah values object menjadi array value
     */
    async updateUser(id: string, data: Partial<Omit<User, 'id' | 'name'>>): Promise<Omit<User, 'password'>> {
        const user = await this.usersRepository.findById(id)
        if (!user) throw new NotFoundException('USER_NOT_FOUND')
        return user
    }

    async deleteUser(id: string): Promise<void> {
        const isDeleted = await this.usersRepository.softDelete(id)
        if (!isDeleted) {
            throw new NotFoundException('USER_NOT_FOUND')
        }
    }
}
