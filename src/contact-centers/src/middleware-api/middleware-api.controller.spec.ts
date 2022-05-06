import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareApiController } from './middleware-api.controller';
import { CccModule } from '../../ccc-module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { components } from './types';
import { PutSettingsBody } from './dto';
import * as LaunchDarkly from 'launchdarkly-node-server-sdk';
import { FeatureFlagEnum } from '../feature-flag/feature-flag.enum';

describe('MiddlewareApiController', () => {
  let app: INestApplication;
  const serviceNowCustomerHeader =
    'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vbW9jay1zZXJ2ZXIuc2VydmljZS1ub3cuY29tIn0=';
  const genesysCustomerHeader =
    'eyJpbnN0YW5jZVVybCI6Imh0dHBzOi8vYXBpLnVzdzIucHVyZS5jbG91ZCIsIm9BdXRoVXJsIjoiaHR0cHM6Ly9sb2dpbi51c3cyLnB1cmUuY2xvdWQiLCJjbGllbnRJZCI6ImNlZTIwYjBmLTE4ODEtNGI4ZS1iZWExLTRmYTYyNWVjMGM3MiIsImNsaWVudFNlY3JldCI6Il94YWJjZGVmIiwiZ3JhbnRUeXBlIjoiY2xpZW50X2NyZWRlbnRpYWxzIiwiT01JbnRlZ3JhdGlvbklkIjoiYTIxNzE3NDItNzM1OS00MWNmLWFhNjgtYWQ1MDQ5MjUwODA2IiwiT01RdWV1ZUlkIjoiMGM1NGY2MTYtNTBkNi00M2EwLTkzNzMtZWNkYTBkYzBmNjliIn0=';
  const flexCustomerHeader =
    'eyJhY2NvdW50U2lkIjoiQUM0NTM0ZTIwMDlkODJjNDM3OTVkNGFlMDA1YjlidDQ4NCIsImF1dGhUb2tlbiI6IngxMjN4YWJjIiwic2VydmljZVNpZCI6IklTM2QyOTM0NTg1Y2FiNGZiNTljYzc1YTIxN2JiZjY3M3MiLCJ3b3Jrc3BhY2VTaWQiOiJXU2E1Nzg3ZTYzOGY2MjFlMzM0MWRmNmM4YTBkNGMwbjFpIiwiZmxleEZsb3dTaWQiOiJGTzdjZmJhMjFjYmFhOTg4ZWFkOGQ3MWVlMGY0ZDQxYTg5In0=';

  beforeEach(async () => {
    // @ts-ignore
    LaunchDarkly.__mockFlags({
      [FeatureFlagEnum.PE_19853]: true,
      [FeatureFlagEnum.PE_19446]: false,
      [FeatureFlagEnum.History]: true,
    });
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

    await app.init();
  });

  describe('/contactCenter/v1/settings (PUT)', () => {
    let putSettings = () =>
      request(app.getHttpServer())
        .put('/contactCenter/v1/settings')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('OK', async () => {
      const body: PutSettingsBody = {
        callbackToken: 'abc',
        callbackURL: 'http://my-computer.ngrok.com',
        integrationName: 'ServiceNow',
        integrationFields: {},
      };
      const response = await putSettings().send(JSON.stringify(body));

      expect(response.statusCode).toEqual(200);
      expect(response.body.callbackToken).toEqual(body.callbackToken);
      expect(response.body.callbackURL).toEqual(body.callbackURL);
      expect(response.body.integrationName).toEqual(body.integrationName);
      expect(response.body.integrationFields).toBeDefined();
    });

    it('Empty body', async () => {
      const body = {
        integrationName: 'Empty integration',
      } as PutSettingsBody;
      const response = await putSettings().send(JSON.stringify(body));
      expect(response.statusCode).toEqual(400);
    });
  });

  describe('/contactCenter/v1/settings (GET)', () => {
    let getSettings = () =>
      request(app.getHttpServer())
        .get('/contactCenter/v1/settings')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('OK', async () => {
      const body: PutSettingsBody = {
        callbackToken: 'abc',
        callbackURL: 'http://my-computer.ngrok.com',
        integrationName: 'ServiceNow',
        integrationFields: {},
      };
      const response = await getSettings();

      expect(response.statusCode).toEqual(200);
      expect(response.body.callbackToken).toEqual(body.callbackToken);
      expect(response.body.callbackURL).toEqual(body.callbackURL);
      expect(response.body.integrationName).toEqual(body.integrationName);
      expect(response.body.integrationFields).toBeDefined();
    });
  });

  describe('/contactCenter/v1/agents/availability (GET)', () => {
    let getAgentAvailability = () =>
      request(app.getHttpServer())
        .get('/contactCenter/v1/agents/availability')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('ServiceNow: OK', async () => {
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

    it('Genesys: OK', async () => {
      const response = await getAgentAvailability()
        .query({ skill: 'Test1' })
        .set('x-pypestream-customer', genesysCustomerHeader)
        .set('x-pypestream-integration', 'Genesys');

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

    it('ServiceNow: Bad request: skill param is required', async () => {
      const response = await getAgentAvailability()
        .set(
          'x-pypestream-customer',
          'eyJVUkwiOiJodHRwczovL21vY2stc2VydmVyLnNlcnZpY2Utbm93LmNvbSJ9',
        )
        .set('x-pypestream-integration', 'ServiceNow');

      expect(response.statusCode).toEqual(400);
    });

    it('Genesys: Bad request: skill param is required', async () => {
      const response = await getAgentAvailability()
        .set('x-pypestream-customer', genesysCustomerHeader)
        .set('x-pypestream-integration', 'Genesys');

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

    it('ServiceNow: OK', async () => {
      const body: components['schemas']['Message'] = {
        content: 'I am new message',
        senderId: 'user-123',
        side: 'user',
      };
      const response = await putMessage()
        .set('x-pypestream-customer', serviceNowCustomerHeader)
        .set('x-pypestream-integration', 'ServiceNow')
        .send(JSON.stringify(body));

      expect(response.statusCode).toEqual(204);
    });

    it('Genesys: OK', async () => {
      const body: components['schemas']['Message'] = {
        content: 'I am new message',
        senderId: 'user-123',
        side: 'user',
      };
      const response = await putMessage()
        .set('x-pypestream-customer', genesysCustomerHeader)
        .set('x-pypestream-integration', 'Genesys')
        .send(JSON.stringify(body));

      expect(response.statusCode).toEqual(204);
    });

    it('Flex: OK', async () => {
      const body: components['schemas']['Message'] = {
        content: 'I am new message',
        senderId: 'user-123',
        side: 'user',
      };
      const response = await putMessage()
        .set('x-pypestream-customer', flexCustomerHeader)
        .set('x-pypestream-integration', 'Flex')
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
        .set('x-pypestream-customer', serviceNowCustomerHeader)
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
      .set('User-Agent', 'supertest')
      .set('Content-Type', 'application/octet-stream')
      .set('x-pypestream-customer', serviceNowCustomerHeader)
      .set('x-pypestream-integration', 'ServiceNow')
      .send(JSON.stringify(body));

    expect(response.statusCode).toEqual(204);
  });

  describe('/conversations/:conversationId/escalate (POST)', () => {
    const postEscalate = () =>
      request(app.getHttpServer())
        .post('/contactCenter/v1/conversations/conversation-123/escalate')
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    const body: components['schemas']['Escalate'] = {
      skill: 'general',
      userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    };

    it('Escalate to ServiceNow agent', async () => {
      const response = await postEscalate()
        .set('x-pypestream-customer', serviceNowCustomerHeader)
        .set('x-pypestream-integration', 'ServiceNow')
        .send(JSON.stringify(body));
      expect(response.statusCode).toEqual(201);
    });

    it('Escalate to Genesys agent', async () => {
      const response = await postEscalate()
        .set('x-pypestream-customer', genesysCustomerHeader)
        .set('x-pypestream-integration', 'Genesys')
        .send(JSON.stringify(body));
      expect(response.statusCode).toEqual(201);
    });

    it('Escalate to Genesys agent with bad body', async () => {
      const response = await postEscalate()
        .set('x-pypestream-customer', genesysCustomerHeader)
        .set('x-pypestream-integration', 'Genesys')
        .send(
          JSON.stringify({
            foo: 'bar',
          }),
        );
      expect(response.statusCode).toEqual(400);
    });

    it('Escalate to Genesys agent without x-pypestream-customer header', async () => {
      const response = await postEscalate()
        .set('x-pypestream-integration', 'Genesys')
        .send(JSON.stringify(body));
      expect(response.statusCode).toEqual(500);
    });

    it('Escalate to Flex agent', async () => {
      const response = await postEscalate()
        .set('x-pypestream-customer', flexCustomerHeader)
        .set('x-pypestream-integration', 'Flex')
        .send(JSON.stringify(body));
      expect(response.statusCode).toEqual(201);
    });

    it('Escalate to Flex agent with bad body', async () => {
      const response = await postEscalate()
        .set('x-pypestream-customer', flexCustomerHeader)
        .set('x-pypestream-integration', 'Flex')
        .send(
          JSON.stringify({
            foo: 'bar',
          }),
        );
      expect(response.statusCode).toEqual(400);
    });

    it('Escalate to Flex agent without x-pypestream-customer header', async () => {
      const response = await postEscalate()
        .set('x-pypestream-integration', 'Flex')
        .send(JSON.stringify(body));
      expect(response.statusCode).toEqual(500);
    });

    it('Escalate to Unknown agent', async () => {
      const response = await postEscalate()
        .set('x-pypestream-customer', genesysCustomerHeader)
        .set('x-pypestream-integration', 'Unknown')
        .send(JSON.stringify(body));
      expect(response.statusCode).toEqual(500);
    });
  });

  describe('/conversations/:conversationId/end (POST)', () => {
    it('ServiceNow agent: End chat', async () => {
      const response = await request(app.getHttpServer())
        .post('/contactCenter/v1/conversations/conversation-123/end')
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream')
        .set('x-pypestream-customer', serviceNowCustomerHeader)
        .set('x-pypestream-integration', 'ServiceNow')
        .send();

      expect(response.statusCode).toEqual(204);
    });
    it('Genesys agent: End chat', async () => {
      const response = await request(app.getHttpServer())
        .post('/contactCenter/v1/conversations/conversation-123/end')
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream')
        .set('x-pypestream-customer', genesysCustomerHeader)
        .set('x-pypestream-integration', 'Genesys')
        .send();

      expect(response.statusCode).toEqual(204);
    });
    it('Flex agent: End chat', async () => {
      const response = await request(app.getHttpServer())
        .post('/contactCenter/v1/conversations/conversation-123/end')
        .set('Content-Type', 'application/json')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream')
        .set('x-pypestream-customer', flexCustomerHeader)
        .set('x-pypestream-integration', 'Flex')
        .send();

      expect(response.statusCode).toEqual(204);
    });
  });
});
