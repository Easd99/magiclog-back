import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Module({
  providers: [ProductsService, CloudinaryService],
  controllers: [ProductsController],
  imports: [TypeOrmModule.forFeature([Product])],
  exports: [ProductsService],
})
export class ProductsModule {}
