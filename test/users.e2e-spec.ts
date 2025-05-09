import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { initializeTransactionalContext } from 'typeorm-transactional';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let user;

  beforeAll(async () => {
    initializeTransactionalContext();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    moduleFixture.get<DataSource>(getDataSourceToken());
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    const newUser = {
      name: 'Test User',
      email: 'testing@test.com',
      password: 'password',
      confirmPassword: 'password',
      role: 'admin',
    };
    it('should create a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(newUser);
      expect(res.status).toBe(201);
      user = res.body;
    });
    it('should return error if user already exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(newUser);
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('email already exists');
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const res = await request(app.getHttpServer()).get('/users');
      expect(res.status).toBe(200);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by id', async () => {
      const res = await request(app.getHttpServer()).get(`/users/${user.id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(user.id);
    });
    it('should return error if user not found', async () => {
      const res = await request(app.getHttpServer()).get('/users/-1');
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({ name: 'Updated User' });
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Updated User');
    });
    it('should return error if user not found', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/-1')
        .send({ name: 'Updated User' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should return error if user not found', async () => {
      const res = await request(app.getHttpServer()).delete('/users/-1');
      expect(res.status).toBe(404);
    });
    it('should delete a user', async () => {
      const res = await request(app.getHttpServer()).delete(
        `/users/${user.id}`,
      );
      expect(res.status).toBe(204);
    });
  });
});
