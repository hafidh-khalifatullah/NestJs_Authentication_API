import { Controller, Get, Param, ParseUUIDPipe, Post, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './interface/user';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @UseGuards(AuthGuard)
    @Get()
    async readUsers(): Promise<User[]> {
        return await this.usersService.getUsers()
    }

    @Get(':id')
    async readUserById(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
        return await this.usersService.getUsersById(id)
    }

    @Patch(':id')
    async updateUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: UpdateUserDto
    ): Promise<User> {
        return await this.usersService.updateUser(id, updateUserDto)
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
        await this.usersService.deleteUser(id)
        return {
            messege: 'user berhasil dihapus'
        }
    }
}