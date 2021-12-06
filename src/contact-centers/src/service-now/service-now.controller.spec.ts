import { Test, TestingModule } from '@nestjs/testing';
import { ServiceNowController } from './service-now.controller';
import { forwardRef, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ServiceNowModule } from './service-now.module';
import { ServiceNowConfig } from './types';
import { CccModule } from '../../ccc-module';

const serviceNowConfig: ServiceNowConfig = {
  instanceUrl: 'https://mock-server.service-now.com',
  token: 'abc-123-token',
  middlewareApiUrl: 'https://mock-server.middleware.com',
};

describe('ServiceNowController', () => {
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
      requestId: 'req-123',
      clientSessionId: 'client-session-id-123',
      nowSessionId: 'now-session-id-123',
      message: {
        text: 'Test Message',
        typed: true,
        clientMessageId: 'client-message-id-123',
      },
      userId: 'user-123',
      body: [],
      agentChat: true,
      completed: true,
      score: 1,
      clientVariables: serviceNowConfig,
    };
    await app.init();
  });

  describe('/service-now/webhook (POST)', () => {
    let postAction = () =>
      request(app.getHttpServer())
        .post('/service-now/webhook')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('typing-indicator body', async () => {
      const typingBody = {
        actionType: 'StartTypingIndicator',
        uiType: 'ActionMsg',
      };

      const response = await postAction().send(
        JSON.stringify({
          ...body,
          body: [typingBody],
        }),
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);
    });

    it('typing-indicator and end-conversation body', async () => {
      const typingBody = {
        actionType: 'StartTypingIndicator',
        uiType: 'ActionMsg',
      };

      const endConversationBody = {
        uiType: 'ActionMsg',
        actionType: 'System',
        message: 'ended',
      };

      const response = await postAction().send(
        JSON.stringify({ ...body, body: [typingBody, endConversationBody] }),
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(2);
    });

    it('with send-message body', async () => {
      const newMessageBody = {
        uiType: 'OutputText',
        group: 'DefaultText',
        value: 'I am new message',
      };

      const response = await postAction().send(
        JSON.stringify({ ...body, body: [newMessageBody] }),
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);
    });

    it('Bad body', async () => {
      const response = await postAction().send(
        JSON.stringify({ ...body, score: null }),
      );

      expect(response.statusCode).toEqual(400);
    });

    it('Empty body', async () => {
      const response = await postAction().send(JSON.stringify({}));

      expect(response.statusCode).toEqual(400);
    });

    it('No body', async () => {
      const response = await postAction();

      expect(response.statusCode).toEqual(400);
    });
  });
});
