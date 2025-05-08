import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from "class-transformer";

export class ProductUpdateDto {

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price?: number;
}
