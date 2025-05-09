import { UserResponseDto } from '../../users/dto/user-response.dto';

export class ProductResponseDto {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  user?: UserResponseDto;
  image?: string;
  imageURL?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
