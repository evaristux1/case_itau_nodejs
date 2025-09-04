import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App e2e', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();
        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('not found is wrapped and has requestId', async () => {
        const res = await request(app.getHttpServer())
            .get('/api/v1/__not_found__')
            .expect(404);
        expect(res.body.success).toBe(false);
    });
});
