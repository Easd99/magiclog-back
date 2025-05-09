import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ProductResponseDto } from '../src/products/dto/product-response.dto';

describe('ProductsController (e2e)', () => {
  let app: INestApplication;
  let product: ProductResponseDto;
  let token: string;
  let userId: number;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    moduleFixture.get<DataSource>(getDataSourceToken());

    const newUser = {
      name: 'Test User',
      email: 'testing.products@test.com',
      password: 'password',
      confirmPassword: 'password',
      role: 'admin',
    };

    let res;
    res = await request(app.getHttpServer()).post('/users').send(newUser);
    userId = res.body.id;
    res = await request(app.getHttpServer()).post('/auth/login').send({
      email: newUser.email,
      password: newUser.password,
    });
    token = res.body.access_token;
  });

  afterAll(async () => {
    await request(app.getHttpServer()).delete(`/users/${userId}`);
    await app.close();
  });

  describe('POST /products', () => {
    const newProduct = {
      name: 'Product Test',
      sku: 'TEST123',
      quantity: 10,
      price: 99.99,
      userId: userId,
    };
    it('should create a new product', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);
      expect(res.status).toBe(201);
      product = res.body;
      expect(product).toHaveProperty('id');
    });
    it('should return error if product already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${token}`)
        .send(newProduct);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /products', () => {
    it('should return all products', async () => {
      const res = await request(app.getHttpServer()).get('/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /products/:id', () => {
    it('should return a product by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/products/${product.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(product.id);
    });
    it('should return error if product not found', async () => {
      const res = await request(app.getHttpServer())
        .get('/products/-1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /products/:id', () => {
    it('should update a product', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/products/${product.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Product' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated Product');
    });
    it('should return error if product not found', async () => {
      const res = await request(app.getHttpServer())
        .patch('/products/-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Another Name' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /products/:id', () => {
    it('should return error if product not found', async () => {
      const res = await request(app.getHttpServer())
        .delete('/products/-1')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
    it('should delete the product', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/products/${product.id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(204);
    });
  });
});
