import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from 'src/ dtos/create-user.dto';
import { NotFoundError } from 'rxjs';
import { UpdateUserDto } from 'src/ dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAll() {
    const users = await this.usersService.getAll();
    const itemsCount = users.length;
    return {
      message: 'all users listed',
      meta: {
        itemsCount,
      },
      data: users,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      message: 'user listed',
      data: user,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const user = await this.usersService.delete(id);
    if (user)
      return {
        message: 'user deleted',
      };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'user updated',
      data: user,
    };
  }
}
