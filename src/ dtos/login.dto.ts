import { IsEmail, IsString, MinLength } from 'class-validator';
import { Normalize } from './create-user.dto';

export class CreateUserDto {
  @Normalize()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
}
