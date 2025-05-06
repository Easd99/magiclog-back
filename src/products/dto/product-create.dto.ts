import { IsNumber, IsOptional, IsString } from "class-validator";

export class ProductCreateDto {
  @IsString()
  name: string;

  @IsString()
  sku: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  userId: number;
}
