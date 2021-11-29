import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareApiController } from './middleware-api.controller';
import { CccModule } from '../../ccc-module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { components } from './types';

describe('MiddlewareApiController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    let moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MiddlewareApiController],
      imports: [
        CccModule.forRoot({
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

    await app.init();
  });

  describe('/contactCenter/v1/agents/availability (GET)', () => {
    let getAgentAvailability = () =>
      request(app.getHttpServer())
        .get('/contactCenter/v1/agents/availability')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('OK', async () => {
      const response = await getAgentAvailability()
        .query({ skill: 'Test1' })
        .set(
          'x-pypestream-customer',
          'eyJVUkwiOiJodHRwczovL21vY2stc2VydmVyLnNlcnZpY2Utbm93LmNvbSJ9',
        )
        .set('x-pypestream-integration', 'ServiceNow');

      expect(response.statusCode).toEqual(200);
      expect(response.body.available).toBeDefined();
      expect(response.body.estimatedWaitTime).toBeDefined();
      expect(response.body.status).toBeDefined();
      expect(response.body.hoursOfOperation).toBeDefined();
      expect(response.body.queueDepth).toBeDefined();
    });

    it('Bad Request no headers', async () => {
      const response = await getAgentAvailability().query({ skill: 'Test1' });

      expect(response.statusCode).toEqual(400);
    });

    it('Bad request: skill param is required', async () => {
      const response = await getAgentAvailability()
        .set(
          'x-pypestream-customer',
          'eyJVUkwiOiJodHRwczovL21vY2stc2VydmVyLnNlcnZpY2Utbm93LmNvbSJ9',
        )
        .set('x-pypestream-integration', 'ServiceNow');

      expect(response.statusCode).toEqual(400);
    });
  });

  describe('/contactCenter/v1/agents/waitTime (GET)', () => {
    const getWaitTime = () =>
      request(app.getHttpServer())
        .get('/contactCenter/v1/agents/waitTime')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('OK', async () => {
      const response = await getWaitTime().query({ skill: 'Test1' });
      expect(response.statusCode).toEqual(200);
      expect(response.body.estimatedWaitTime).toBeDefined();
    });

    it('Bad request: skill param is required', async () => {
      const response = await getWaitTime();
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('/contactCenter/v1/conversations/:conversationId/messages/:messageId (PUT)', () => {
    const putMessage = () =>
      request(app.getHttpServer())
        .put(
          '/contactCenter/v1/conversations/:conversationId/messages/:messageId',
        )
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('OK', async () => {
      const body: components['schemas']['Message'] = {
        content: 'I am new message',
        senderId: 'user-123',
        side: 'user',
      };
      const response = await putMessage()
        .set(
          'x-pypestream-customer',
          'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vbW9jay1zZXJ2ZXIuc2VydmljZS1ub3cuY29tIn0=',
        )
        .set('x-pypestream-integration', 'ServiceNow')
        .send(JSON.stringify(body));

      expect(response.statusCode).toEqual(204);
    });

    it('Bad Request: No customer headers', async () => {
      const body: components['schemas']['Message'] = {
        content: 'I am new message',
        senderId: 'user-123',
        side: 'user',
      };
      const response = await putMessage().send(JSON.stringify(body));

      expect(response.statusCode).toEqual(400);
    });

    it('Bad Request: No Body', async () => {
      const response = await putMessage()
        .set(
          'x-pypestream-customer',
          'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vbW9jay1zZXJ2ZXIuc2VydmljZS1ub3cuY29tIn0=',
        )
        .set('x-pypestream-integration', 'ServiceNow')
        .send();

      expect(response.statusCode).toEqual(400);
    });
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

  it('/conversations/:conversationId/escalate (POST)', async () => {
    const body: components['schemas']['Escalate'] = {
      skill: 'general',
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };
    const response = await request(app.getHttpServer())
      .post('/contactCenter/v1/conversations/conversation-123/escalate')
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'supertest')
      .set('Content-Type', 'application/octet-stream')
      .set(
        'x-pypestream-customer',
        'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vbW9jay1zZXJ2ZXIuc2VydmljZS1ub3cuY29tIn0=',
      )
      .set('x-pypestream-integration', 'ServiceNow')
      .send(JSON.stringify(body));

    expect(response.statusCode).toEqual(201);
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

  describe('/contactCenter/v1/conversations/:conversationId/messages/:messageId (PUT) Genesys', () => {
    const putMessage = () =>
      request(app.getHttpServer())
        .put(
          '/contactCenter/v1/conversations/:conversationId/messages/:messageId',
        )
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('OK', async () => {
      const body: components['schemas']['Message'] = {
        content: 'I am new message',
        senderId: 'user-123',
        side: 'user',
      };
      const response = await putMessage()
        .set(
          'x-pypestream-customer',
          'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vYXBpLnVzdzIucHVyZS5jbG91ZCIsIm9BdXRoVXJsIjoiaHR0cHM6Ly9sb2dpbi51c3cyLnB1cmUuY2xvdWQiLCJjbGllbnRJZCI6ImNlZTIwYjBmLTE4ODEtNGI4ZS1iZWExLTRmYTYyNWVjMGM3MiIsImNsaWVudFNlY3JldCI6Il9wbmdwUXk4Q0dwRjY5ZFZnT2xuV1p1Q3dSakdOMUVqS3Fwdi1HcEFjWVEiLCJncmFudFR5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJPTUludGVncmF0aW9uSWQiOiJhMjE3MTc0Mi03MzU5LTQxY2YtYWE2OC1hZDUwNDkyNTA4MDYifQ==',
        )
        .set('x-pypestream-integration', 'Genesys')
        .send(JSON.stringify(body));
      console.log(response.text);
      expect(response.statusCode).toEqual(204);
    });

    it('Bad Request: No Body', async () => {
      const response = await putMessage()
        .set(
          'x-pypestream-customer',
          'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vYXBpLnVzdzIucHVyZS5jbG91ZCIsIm9BdXRoVXJsIjoiaHR0cHM6Ly9sb2dpbi51c3cyLnB1cmUuY2xvdWQiLCJjbGllbnRJZCI6ImNlZTIwYjBmLTE4ODEtNGI4ZS1iZWExLTRmYTYyNWVjMGM3MiIsImNsaWVudFNlY3JldCI6Il9wbmdwUXk4Q0dwRjY5ZFZnT2xuV1p1Q3dSakdOMUVqS3Fwdi1HcEFjWVEiLCJncmFudFR5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJPTUludGVncmF0aW9uSWQiOiJhMjE3MTc0Mi03MzU5LTQxY2YtYWE2OC1hZDUwNDkyNTA4MDYifQ==',
        )
        .set('x-pypestream-integration', 'Genesys')
        .send();

      expect(response.statusCode).toEqual(400);
    });
  });
  it('/conversations/:conversationId/escalate (POST) Genesys', async () => {
    const body: components['schemas']['Escalate'] = {
      skill: 'general',
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };
    const response = await request(app.getHttpServer())
      .post('/contactCenter/v1/conversations/conversation-123/escalate')
      .set('Content-Type', 'application/json')
      .set('User-Agent', 'supertest')
      .set('Content-Type', 'application/octet-stream')
      .set(
        'x-pypestream-customer',
        'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vYXBpLnVzdzIucHVyZS5jbG91ZCIsIm9BdXRoVXJsIjoiaHR0cHM6Ly9sb2dpbi51c3cyLnB1cmUuY2xvdWQiLCJjbGllbnRJZCI6ImNlZTIwYjBmLTE4ODEtNGI4ZS1iZWExLTRmYTYyNWVjMGM3MiIsImNsaWVudFNlY3JldCI6Il9wbmdwUXk4Q0dwRjY5ZFZnT2xuV1p1Q3dSakdOMUVqS3Fwdi1HcEFjWVEiLCJncmFudFR5cGUiOiJjbGllbnRfY3JlZGVudGlhbHMiLCJPTUludGVncmF0aW9uSWQiOiJhMjE3MTc0Mi03MzU5LTQxY2YtYWE2OC1hZDUwNDkyNTA4MDYifQ==',
      )
      .set('x-pypestream-integration', 'Genesys')
      .send(JSON.stringify(body));

    expect(response.statusCode).toEqual(201);
  });
});
