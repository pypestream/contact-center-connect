import { Test, TestingModule } from '@nestjs/testing';
import { GenesysController } from './genesys.controller';
import { CccModule } from '../../ccc-module';
import { forwardRef, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GenesysModule } from './genesys.module';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';

describe('GenesysController', () => {
  let app: INestApplication;
  let body;

  beforeEach(async () => {
    let moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [],
      imports: [
        CccModule.forRoot({
          url: 'https://mock-server.middleware.com',
          token: 'fake token',
        }),
      ],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    body = {
      id: '36e4d8d92b071f15116d01d111bb8802',
      channel: {
        id: 'a2171742-7359-41cf-aa68-ad5049250806',
        platform: 'Open',
        type: 'Private',
        to: { id: '5608add1-7b77-460b-a7f0-97a8d8f2b6db' },
        from: {
          nickname: 'PS testing OM Integration',
          id: 'a2171742-7359-41cf-aa68-ad5049250806',
          idType: 'Opaque',
        },
        time: '2021-11-25T09:42:16.302Z',
        messageId: '36e4d8d92b071f15116d01d111bb8802',
      },
      type: 'Text',
      text: 'Hello there!',
      originatingEntity: 'Human',
      direction: 'Outbound',
    };
    await app.init();
  });

  describe('/genesys/webhook (POST)', () => {
    let postAction = () =>
      request(app.getHttpServer())
        .post('/genesys/webhook')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('with send-message', async () => {
      const response = await postAction().send(JSON.stringify(body));

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);
    });

    it('Empty body', async () => {
      const response = await postAction().send(JSON.stringify({}));

      expect(response.statusCode).toEqual(400);
    });

    it('No body', async () => {
      const response = await postAction();

      expect(response.statusCode).toEqual(400);
    });

    it('Bad body', async () => {
      const response = await postAction().send(
        JSON.stringify({ ...body, id: null }),
      );

      expect(response.statusCode).toEqual(400);
    });
  });
});
