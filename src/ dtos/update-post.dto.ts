import { IsOptional, IsString, Length } from 'class-validator';
import { Normalize } from './create-user.dto';

export class UpdatePostDto {
  @Normalize()
  @IsString()
  @Length(2, 1024)
  @IsOptional()
  content?: string;
}
