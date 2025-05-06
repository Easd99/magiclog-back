import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UserFilterDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsBoolean()
  password?: boolean;

  @IsOptional()
  @IsString()
  role?: string;
}
