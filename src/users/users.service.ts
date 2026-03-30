import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/ dtos/create-user.dto';
import * as argon from 'argon2';
import { UpdateUserDto } from 'src/ dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const hashedPassword = await argon.hash(createUserDto.password);
      const userObj = new this.userModel({
        email: createUserDto.email,
        password: hashedPassword,
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

  async getAll() {
    return await this.userModel.find();
  }

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

  async findUserByEmailForAuth(email: string) {
    return await this.userModel
      .findOne({ email })
      .select('_id email password role');
  }

  async findUserByIdForAuth(id: string) {
    return await this.userModel.findById(id).select('+refreshToken role');
  }

  async updateRefreshToken(id: string, refreshToken: string | null) {
    const update = refreshToken
      ? { refreshToken: await argon.hash(refreshToken) }
      : { refreshToken: null };

    return this.userModel.findByIdAndUpdate(id, update, {
      new: true,
    });
  }
}
