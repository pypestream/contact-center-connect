import { Test, TestingModule } from '@nestjs/testing';
import { FlexController } from './flex.controller';
import { CccModule } from '../../ccc-module';
import { forwardRef, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { FlexModule } from './flex.module';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';

describe('FlexController', () => {
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
      ChannelSid: 'CH20af96abd9884e74a67999a39555b695',
      ClientIdentity: 'si',
      RetryCount: '0',
      EventType: 'onMessageSend',
      InstanceSid: 'IS3d2934585cab4fb59cc75a217bbf676a',
      Attributes: '{}',
      DateCreated: '2022-04-12T11:37:27.844Z',
      From: 'si',
      To: 'CH20af96abd9884e74a67999a39555b695',
      Body: 'ok ok',
      AccountSid: 'AC4534e2009d82c43795d4ae005b9b72e4',
      Source: 'SDK',
    };
    await app.init();
  });

  describe('/flex/webhook (POST)', () => {
    let postAction = () =>
      request(app.getHttpServer())
        .post('/flex/webhook')
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
        JSON.stringify({ ...body, EventType: null }),
      );

      expect(response.statusCode).toEqual(400);
    });
  });
});
