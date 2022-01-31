import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { FreshChatConfig } from './types';
import { CccModule } from '../../ccc-module';

const serviceNowConfig: FreshChatConfig = {
  instanceUrl: 'https://mock-server.fresh-chat.com',
  token: 'abc-123-token',
  middlewareApiUrl: 'https://mock-server.middleware.com',
};

describe('FreshChatController', () => {
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
      actor: {
        actor_type: 'user',
        actor_id: 'a899325a-5b9e-4de9-86de-11b3b6cb3f1a',
      },
      action_time: '2022-01-24T10:46:21.898Z',
      data: {
        message: {
          message_parts: [{ text: { content: 'hey dude!!' } }],
          app_id: '5eaeee8f-5002-498a-863e-7d9bb4c64d93',
          actor_id: 'a899325a-5b9e-4de9-86de-11b3b6cb3f1a',
          id: '4eb766be-2105-4e8b-93fa-2ee212b86316',
          channel_id: '1cd211c4-83f7-4292-b89f-8b768669e208',
          conversation_id: '3016e7b2-f27d-49c7-9eaf-8605a8d7afd3',
          interaction_id: '574529461780494-1643021181880',
          message_type: 'normal',
          actor_type: 'user',
          created_time: '2022-01-24T10:46:21.898Z',
          user_id: 'a899325a-5b9e-4de9-86de-11b3b6cb3f1a',
        },
      },
    };
    await app.init();
  });

  describe('/fresh-chat/webhook (POST)', () => {
    let postAction = () =>
      request(app.getHttpServer())
        .post('/fresh-chat/webhook')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    xit('end-conversation body', async () => {
      const endConversationBody = {
        uiType: 'ActionMsg',
        actionType: 'System',
        message: 'ended',
      };

      const response = await postAction().send(
        JSON.stringify({ ...body, body: [endConversationBody] }),
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(2);
    });

    it('with send-message body', async () => {
      const newMessageBody = {
        action: 'message_create',
      };

      const response = await postAction().send(
        JSON.stringify({ ...body, ...newMessageBody }),
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);
    });

    it('Bad body', async () => {
      const response = await postAction().send(JSON.stringify(body));

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
