import { Transform } from 'class-transformer';
import { IsEmail, IsString, MinLength } from 'class-validator';

export const Normalize = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );
export class CreateUserDto {
  @Normalize()
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
}
