import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductCreateDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @Type(() => Number)
  @IsNumber()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  userId: number;
}
