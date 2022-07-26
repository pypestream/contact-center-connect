import { Test, TestingModule } from '@nestjs/testing';
import { LivePersonController } from './liveperson.controller';
import { CccModule } from '../../ccc-module';
import { forwardRef, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { LivePersonModule } from './liveperson.module';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';

describe('LivePersonController', () => {
  let app: INestApplication;
  let body;

  beforeEach(async () => {
    let moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [],
      imports: [
        CccModule.forRoot({
          url: 'https://mock-server.middleware.com',
          token: 'fake token',
          basicToken: 'fake basic token',
        }),
      ],
      providers: [],
    }).compile();

    app = moduleFixture.createNestApplication();
    body = {
      kind: 'notification',
      body: {
        changes: [
          {
            sequence: 1,
            originatorId: '15b9526e-0c5f-52a6-be8e-4949d2fff767',
            originatorMetadata: {
              id: '15b9526e-0c5f-52a6-be8e-4949d2fff767',
              role: 'MANAGER',
            },
            serverTimestamp: 1658842897200,
            event: {
              type: 'ContentEvent',
              message: 'look good thing there',
              contentType: 'text/plain',
            },
            conversationId: '6e049680-db55-4113-96cd-952998c8b8b5',
            dialogId: '6e049680-db55-4113-96cd-952998c8b8b5',
            messageAudience: 'ALL',
          },
        ],
      },
      type: 'ms.MessagingEventNotification',
    };
    await app.init();
  });

  describe('/liveperson/webhook (POST)', () => {
    let postAction = () =>
      request(app.getHttpServer())
        .post('/liveperson/webhook')
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
        JSON.stringify({ ...body, type: null }),
      );

      expect(response.statusCode).toEqual(400);
    });
  });
});
