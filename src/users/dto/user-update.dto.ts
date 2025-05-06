import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UserUpdateDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: string;
}
