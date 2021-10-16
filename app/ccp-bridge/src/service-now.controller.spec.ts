import { Test, TestingModule } from '@nestjs/testing';
import { ServiceNowController } from './service-now.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';
import {
  MiddlewareApiConfig,
  MiddlewareApiService,
  ContactCenterProConfig,
  ServiceNowConfig,
} from '@ccp/sdk';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

const serviceNowConfig: ServiceNowConfig = {
  instanceUrl: 'https://mock-server.service-now.com',
};

const middlewareApiConfig: MiddlewareApiConfig = {
  instanceUrl: 'https://mock-server.middleware.com',
  token: 'fake token',
};

const ccpConfig: ContactCenterProConfig = {
  instanceUrl: 'https://localhost:3000',
};

describe('AgentController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    let moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ServiceNowController],
      imports: [
        CcpModule.forRoot({
          middlewareApi: middlewareApiConfig,
          ccp: ccpConfig,
          serviceNow: serviceNowConfig,
        }),
      ],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/agent/webhook (POST)', async () => {
    const body = {
      requestId: 'req-123',
      clientSessionId: 'client-session-id-123',
      nowSessionId: 'now-session-id-123',
      message: {
        text: 'Test Message',
        typed: true,
        clientMessageId: 'client-message-id-123',
      },
      userId: '123',
      body: [],
      agentChat: true,
      completed: true,
      score: 1,
    };
    const response = await request(app.getHttpServer())
      .post('/agent/webhook')
      .set('Content-Type', 'application/octet-stream')
      .send(JSON.stringify(body));

    expect(response.statusCode).toEqual(200);
  });
});
