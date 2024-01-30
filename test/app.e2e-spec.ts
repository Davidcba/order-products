import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth')
      .expect(200);

    expect(response.text).toBe('helloworld');
  });

  it('/auth/token (POST) - Successful authentication', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/token')
      .send({ username: 'testUser', password: 'testPassword' })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
  });

  it('/auth/token (POST) - Invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/token')
      .send({ username: 'invalidUser', password: 'invalidPassword' })
      .expect(401);
  });
});
