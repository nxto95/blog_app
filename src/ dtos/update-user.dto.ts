import { IsOptional, IsString, Length } from 'class-validator';
import { Normalize } from './create-user.dto';

export class UpdateUserDto {
  @Normalize()
  @IsOptional()
  @IsString()
  @Length(2, 55)
  username?: string;
}
