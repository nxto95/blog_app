import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export const Normalize = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
export class CreateUserDto {
  @Normalize()
  @IsEmail()
  email: string;
  @IsString()
  @Length(2, 55)
  username: string;
  @IsString()
  @MinLength(8)
  password: string;
}
