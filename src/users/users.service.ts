import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../ dtos/create-user.dto';
import * as argon from 'argon2';
import { UpdateUserDto } from '../ dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  // [01] create user
  async create(createUserDto: CreateUserDto) {
    try {
      const userObj = new this.userModel({
        email: createUserDto.email,
        password: await this.hash(createUserDto.password),
        username: createUserDto.username,
      });
      return await userObj.save();
    } catch (error: any) {
      if (error.name === 'MongoServerError' && error.code === 11000) {
        if (error.keyPattern?.email) {
          throw new ConflictException(
            `User with email "${error.keyValue.email}" already exists`,
          );
        }
        if (error.keyPattern?.username) {
          throw new ConflictException(
            `User with username "${error.keyValue.username}" already exists`,
          );
        }
      }
      throw error;
    }
  }
  // [02] update user
  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      });
      if (!user)
        throw new NotFoundException(`user with this [${id}] id not found`);
      return user;
    } catch (error) {
      // catch wrong id input
      if ((error.name === 'CastError', error.kind === 'ObjectId')) {
        throw new BadRequestException('invalid id');
      }
      // catch unique constrains
      if (error.name === 'MongoServerError' && error.code === 11000) {
        if (error.keyPattern?.username) {
          throw new ConflictException(
            `Username "${error.keyValue.username}" already exists`,
          );
        }
      }
      throw error;
    }
  }
  // [03] delete user
  async delete(id: string) {
    try {
      const user = await this.userModel.findByIdAndDelete(id);

      return user;
    } catch (error) {
      if ((error.name === 'CastError', error.kind === 'ObjectId'))
        throw new BadRequestException('invalid id');
      throw error;
    }
  }
  // [04] get one user - email => for auth
  async findUserByEmailForAuth(email: string) {
    return await this.userModel
      .findOne({ email })
      .select('_id email password role');
  }
  // [05] get one user - id
  async findById(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user)
        throw new NotFoundException(`user with this [${id}] id not found`);
      return user;
    } catch (error: any) {
      if ((error.name === 'CastError', error.kind === 'ObjectId'))
        throw new BadRequestException('invalid id');
      throw error;
    }
  }
  // [06] get one user - id => for auth
  async findUserByIdForAuth(id: string) {
    try {
      return await this.userModel.findById(id).select('+refreshToken role');
    } catch (error) {
      if ((error.name === 'CastError', error.kind === 'ObjectId')) {
        throw new BadRequestException('invalid id');
      }
    }
  }
  // [07] get all users - TODO => pagination
  async getAll() {
    return await this.userModel.find();
  }
  // [08] update refresh tokens
  async updateRefreshToken(id: string, refreshToken: string | null) {
    try {
      const update = refreshToken
        ? { refreshToken: await this.hash(refreshToken) }
        : { refreshToken: null };

      return this.userModel.findByIdAndUpdate(id, update, {
        new: true,
      });
    } catch (error) {
      if ((error.name === 'CastError', error.kind === 'ObjectId')) {
        throw new BadRequestException('invalid id');
      }
    }
  }
  // [09] hash - utility function
  private async hash(plainText: string) {
    return await argon.hash(plainText);
  }
}
