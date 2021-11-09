import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareApiController } from './middleware-api.controller';
import { CcpModule } from '@ccp/nestjs-module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('MiddlewareApiController', () => {
  let app: INestApplication;
  let body;

  beforeEach(async () => {
    let moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MiddlewareApiController],
      imports: [
        CcpModule.forRoot({
          enableLog: true,
          middlewareApiConfig: {
            url: 'https://mock-server.middleware.com',
            token: 'fake token',
          },
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
      clientVariables: {
        instanceUrl: 'https://mock-server.service-now.com',
        token: 'abc-123-token',
        middlewareApiUrl: 'https://mock-server.middleware.com',
      },
    };
    await app.init();
  });

  it('/contactCenter/v1/agents/availability (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/contactCenter/v1/agents/availability')
      .query({ skill: 'Test1' })
      .set('User-Agent', 'supertest')
      .set(
        'x-pypestream-customer',
        'eyJVUkwiOiJodHRwczovL21vY2stc2VydmVyLnNlcnZpY2Utbm93LmNvbSJ9',
      )
      .set('x-pypestream-integration', 'ServiceNow')
      .set('Content-Type', 'application/octet-stream');

    expect(response.statusCode).toEqual(200);
    expect(response.body.available).toBeDefined();
    expect(response.body.estimatedWaitTime).toBeDefined();
    expect(response.body.status).toBeDefined();
    expect(response.body.hoursOfOperation).toBeDefined();
    expect(response.body.queueDepth).toBeDefined();
  });

  it('/contactCenter/v1/agents/waitTime (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/contactCenter/v1/agents/waitTime')
      .query({ skill: 'Test1' })
      .set('User-Agent', 'supertest')
      .set('Content-Type', 'application/octet-stream');

    expect(response.statusCode).toEqual(200);
    expect(response.body.estimatedWaitTime).toBeDefined();
  });

  it('/contactCenter/v1/conversations/:conversationId/messages/:messageId (PUT)', async () => {
    const body = {
      content: 'I am new message',
      senderId: 'user-123',
      side: 'user',
    };
    const response = await request(app.getHttpServer())
      .put(
        '/contactCenter/v1/conversations/:conversationId/messages/:messageId',
      )
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'supertest')
      .set('Content-Type', 'application/octet-stream')
      .set(
        'x-pypestream-customer',
        'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vbW9jay1zZXJ2ZXIuc2VydmljZS1ub3cuY29tIn0=',
      )
      .set('x-pypestream-integration', 'ServiceNow')

      .send(JSON.stringify(body));

    expect(response.statusCode).toEqual(204);
  });
  it('/conversations/:conversationId/type (POST)', async () => {
    const body = {
      typing: true,
    };
    const response = await request(app.getHttpServer())
      .post('/contactCenter/v1/conversations/conversation-123/type')
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'supertest')
      .set('Content-Type', 'application/octet-stream')
      .set(
        'x-pypestream-customer',
        'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vbW9jay1zZXJ2ZXIuc2VydmljZS1ub3cuY29tIn0=',
      )
      .set('x-pypestream-integration', 'ServiceNow')
      .send(JSON.stringify(body));

    expect(response.statusCode).toEqual(204);
  });
  it('/conversations/:conversationId/end (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/contactCenter/v1/conversations/conversation-123/end')
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'supertest')
      .set('Content-Type', 'application/octet-stream')
      .set(
        'x-pypestream-customer',
        'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vbW9jay1zZXJ2ZXIuc2VydmljZS1ub3cuY29tIn0=',
      )
      .set('x-pypestream-integration', 'ServiceNow')
      .send();

    expect(response.statusCode).toEqual(204);
  });
});
