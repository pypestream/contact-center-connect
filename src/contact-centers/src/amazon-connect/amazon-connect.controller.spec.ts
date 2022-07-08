import { Test, TestingModule } from '@nestjs/testing';
import { AmazonConnectController } from './amazon-connect.controller';
import { CccModule } from '../../ccc-module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AmazonConnectController', () => {
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
      AbsoluteTime: '2022-07-08T09:19:55.806Z',
      Content: "Hey there,I'm great!",
      ContentType: 'text/plain',
      Id: '5cced25f-5ddd-4b48-bfd7-c69374298a12',
      Type: 'MESSAGE',
      ParticipantId: 'df447546-7987-464e-af0b-a598b26b5b4b',
      DisplayName: 'AIDARJE6DXVZS5AEMLZZV',
      ParticipantRole: 'AGENT',
      InitialContactId: 'a0498048-4512-4800-95b8-34a60362468d',
      ContactId: 'a0498048-4512-4800-95b8-34a60362468d',
    };
    await app.init();
  });

  describe('/amazon-connect/webhook (POST)', () => {
    let postAction = () =>
      request(app.getHttpServer())
        .post('/amazon-connect/webhook')
        .set('User-Agent', 'supertest')
        .set('Content-Type', 'application/octet-stream');

    it('with send-message', async () => {
      const response = await postAction().send(JSON.stringify(body));

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);
    });

    // it('Empty body', async () => {
    //   const response = await postAction().send(JSON.stringify({}));

    //   expect(response.statusCode).toEqual(400);
    // });

    // it('No body', async () => {
    //   const response = await postAction();

    //   expect(response.statusCode).toEqual(400);
    // });

    // it('Bad body', async () => {
    //   const response = await postAction().send(
    //     JSON.stringify({ ...body, InitialContactId: null }),
    //   );

    //   expect(response.statusCode).toEqual(400);
    // });
  });
});
