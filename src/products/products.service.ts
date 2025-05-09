import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { User } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Transactional()
  async create(
    productCreateDto: ProductCreateDto,
    image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const { name, sku, quantity, price } = productCreateDto;

    const existingProduct = await this.findAll({
      sku: sku,
    });

    if (existingProduct.length > 0) {
      throw new BadRequestException('product with this SKU already exists');
    }

    let imageLoaded;
    if (image) {
      imageLoaded = await this.cloudinaryService.uploadImage(image);
    }

    const product = await this.productRepository.save({
      name,
      sku,
      quantity,
      price,
      user: { id: productCreateDto.userId },
      image: imageLoaded ? imageLoaded.public_id : undefined,
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
    const products = await queryBuilder.getMany();
    return await Promise.all(
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
    image?: Express.Multer.File,
  ): Promise<ProductResponseDto> {
    const { name, sku, quantity, price } = productUpdateDto;

    const existingProduct = await this.findById(id);

    if (!existingProduct) {
      throw new NotFoundException('product not found');
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

      if (existingProductWithSku && existingProductWithSku.id !== id) {
        throw new BadRequestException('product with this SKU already exists');
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
    if (image) {
      const imageLoaded = await this.cloudinaryService.uploadImage(image);
      existingProduct.image = imageLoaded.public_id;
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
      throw new NotFoundException('product not found');
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

  private async convertToResponseDto(
    product: Product,
  ): Promise<ProductResponseDto> {
    const {
      id,
      name,
      sku,
      quantity,
      user,
      price,
      image,
      createdAt,
      updatedAt,
    } = product;
    return {
      id,
      name,
      sku,
      quantity,
      price,
      user: user ? this.mapUserToResponseDto(user) : undefined,
      image: image,
      imageURL: product.image
        ? await this.cloudinaryService.getImageUrl(product.image)
        : undefined,
      createdAt,
      updatedAt,
    };
  }

  private mapUserToResponseDto(user: User): UserResponseDto {
    const { id, name, email, role, createdAt, updatedAt } = user;
    return { id, name, email, role, createdAt, updatedAt };
  }
}
