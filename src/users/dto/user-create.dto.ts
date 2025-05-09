import { IsEnum, IsString } from 'class-validator';
import { Role } from '../enums/role.enum';

export class UserCreateDto {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  confirmPassword: string;

  @IsEnum(Role)
  @IsString()
  role: string;
}
