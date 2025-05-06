import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(
    productCreateDto: ProductCreateDto,
  ): Promise<ProductResponseDto> {
    const { name, sku, quantity, price } = productCreateDto;

    const existingProduct = await this.findAll({
      sku: sku,
    });

    if (existingProduct.length > 0) {
      throw new BadRequestException('product with this SKU already exists');
    }

    const product = await this.productRepository.save({
      name,
      sku,
      quantity,
      price,
      user: { id: productCreateDto.userId },
    });

    return this.convertToResponseDto(product);
  }

  async findAll(query: ProductFilterDto): Promise<ProductResponseDto[]> {
    const { name, sku } = query;
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    if (name) {
      queryBuilder.andWhere('product.name ILIKE :name', { name: `%${name}%` });
    }
    if (sku) {
      queryBuilder.andWhere('product.sku ILIKE :sku', { sku: `%${sku}%` });
    }

    if (query.userId) {
      queryBuilder.andWhere('product.userId = :userId', {
        userId: query.userId,
      });
    }

    if (query.fetchUser) {
      queryBuilder.leftJoinAndSelect('product.user', 'user');
    }

    queryBuilder.orderBy({
      'product.id': 'ASC',
    });
    return queryBuilder
      .getMany()
      .then((products) =>
        products.map((product) => this.convertToResponseDto(product)),
      );
  }

  async findById(id: number): Promise<ProductResponseDto | undefined> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!product) {
      return undefined;
    }
    return this.convertToResponseDto(product);
  }

  async update(
    id: number,
    productUpdateDto: ProductUpdateDto,
    userId: number,
    role: string,
  ): Promise<ProductResponseDto> {
    const { name, sku, quantity, price } = productUpdateDto;

    const existingProduct = await this.findById(id);

    if (!existingProduct) {
      throw new Error('product not found');
    }

    if (role !== 'admin') {
      if (existingProduct.user.id !== userId) {
        throw new BadRequestException(
          'you are not allowed to update this product',
        );
      }
    }

    if (sku) {
      const existingProductWithSku = (
        await this.findAll({
          sku: sku,
        })
      )[0];

      if (existingProductWithSku && existingProductWithSku[0].id !== id) {
        throw new Error('product with this SKU already exists');
      }
      existingProduct.sku = sku;
    }
    if (name) {
      existingProduct.name = name;
    }
    if (quantity) {
      existingProduct.quantity = quantity;
    }
    if (price) {
      existingProduct.price = price;
    }
    const updatedProduct = await this.productRepository.save({
      ...existingProduct,
    });

    return this.convertToResponseDto(updatedProduct);
  }

  async delete(id: number, userId: number, role: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!product) {
      throw new Error('product not found');
    }

    if (role !== 'admin') {
      if (product.user.id !== userId) {
        throw new BadRequestException(
          'you are not allowed to delete this product',
        );
      }
    }

    await this.productRepository.softRemove(product);
  }

  private convertToResponseDto(product: Product): ProductResponseDto {
    const { id, name, sku, quantity, user, price, createdAt, updatedAt } =
      product;
    return {
      id,
      name,
      sku,
      quantity,
      price,
      user: user ? this.mapUserToResponseDto(user) : undefined,
      createdAt,
      updatedAt,
    };
  }

  private mapUserToResponseDto(user: User): UserResponseDto {
    const { id, email, role, createdAt, updatedAt } = user;
    return { id, email, role, createdAt, updatedAt };
  }
}
