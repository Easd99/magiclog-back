import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductCreateDto } from './dto/product-create.dto';
import { ProductUpdateDto } from './dto/product-update.dto';
import { Request } from 'express';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import * as multer from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Post()
  @HttpCode(201)
  @UseInterceptors(
    FileInterceptor('image', { storage: multer.memoryStorage() }),
  )
  create(
    @UploadedFile() image: Express.Multer.File,
    @Body() productCreateDto: ProductCreateDto,
    @Req() req: Request,
  ) {
    return this.productsService.create(
      {
        ...productCreateDto,
        userId: req.user['userId'],
      },
      image,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query() query: ProductFilterDto) {
    const filter: ProductFilterDto = {
      name: query.name,
      sku: query.sku,
      fetchUser: true,
      price: query.price,
      quantity: query.quantity,
    };

    return this.productsService.findAll(filter);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin')
  findAllByAdmin(@Query() query: ProductFilterDto) {
    const filter: ProductFilterDto = {
      name: query.name,
      sku: query.sku,
      userId: query.userId,
      fetchUser: query.fetchUser,
      price: query.price,
      quantity: query.quantity,
    };

    return this.productsService.findAll(filter);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.SELLER, Role.ADMIN)
  @Get('seller')
  findAllBySellers(@Query() query: ProductFilterDto, @Req() req: Request) {
    const filter: ProductFilterDto = {
      name: query.name,
      sku: query.sku,
      userId: req.user['userId'],
      fetchUser: query.fetchUser,
      price: query.price,
      quantity: query.quantity,
    };
    return this.productsService.findAll(filter);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findById(@Param('id') id: number) {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', { storage: multer.memoryStorage() }),
  )
  async update(
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id: number,
    @Body() productUpdateDto: ProductUpdateDto,
    @Req() req: Request,
  ) {
    return this.productsService.update(
      id,
      {
        ...productUpdateDto,
      },
      req.user['userId'],
      req.user['role'],
      image,
    );
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SELLER)
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Req() req: Request) {
    return this.productsService.delete(
      parseInt(id + ''),
      req.user['userId'],
      req.user['role'],
    );
  }
}
