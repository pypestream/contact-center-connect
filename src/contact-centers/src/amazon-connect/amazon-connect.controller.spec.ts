import { Test, TestingModule } from '@nestjs/testing';
import { AmazonConnectController } from './amazon-connect.controller';
import { CccModule } from '../../ccc-module';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AmazonConnectController', () => {
  let app: INestApplication;
  let messageBody;
  let verificationBody;

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
    messageBody = {
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
    verificationBody = {
      Type: 'SubscriptionConfirmation',
      MessageId: 'c3678c2e-33c6-4841-81a7-2e5ba5adcb88',
      Token:
        '2336412f37fb687f5d51e6e2425dacbba8bdb436d926fa3fc2a7e5a20d1a1d7ed65945af3e22e3d683e224303d168fa9b7394af5ba62e79a6dc3e802848ddcaa516b1a0e205919d08ba3638c5895100a5fb0cbfdf72b7148fdd82b66ec7a63f28b2876bb9d3afbb6f413c6ce3d7b263a',
      TopicArn: 'arn:aws:sns:us-east-1:088378424691:cxsccc',
      Message:
        'You have chosen to subscribe to the topic arn:aws:sns:us-east-1:088378424691:cxsccc.\n' +
        'To confirm the subscription, visit the SubscribeURL included in this message.',
      SubscribeURL:
        'https://sns.us-east-1.amazonaws.com/?Action=ConfirmSubscription&TopicArn=arn:aws:sns:us-east-1:088378424691:cxsccc&Token=2336412f37fb687f5d51e6e2425dacbba8bdb436d926fa3fc2a7e5a20d1a1d7ed65945af3e22e3d683e224303d168fa9b7394af5ba62e79a6dc3e802848ddcaa516b1a0e205919d08ba3638c5895100a5fb0cbfdf72b7148fdd82b66ec7a63f28b2876bb9d3afbb6f413c6ce3d7b263a',
      Timestamp: '2022-07-06T11:26:43.676Z',
      SignatureVersion: '1',
      Signature:
        'cNp6Smfsp8rOg0LTF1gLQKqUUlx13RM4PNg7Op67Twn3K6kk5VcqlJMIQo7RjshjwkseOFwzV3BgPaWLOEQNXTIHw2Tr9zZcjx/eW0M3WzmJ+1y13HeDVvyKar7h+uDKt9g0Y/FhTe7nK0wPLYeG8LzCdBn1vuH8OyUlZmcjVhSXfYMyJAROfR0XKVFITBI/zOIPMbE7n78kEfQxXT+BfaX5eHjd9sOJDE8ZPV/bYJzBnfnp+GlGTFKrheYx758Zi814XPn4HaWREL0h5oiYOf0xTY54KAntR80ZUplwuZdrBVeRqEZ5JtHjzdcTXwlnK5HCwG+lMBwx1whCCsqjwg==',
      SigningCertURL:
        'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-7ff5318490ec183fbaddaa2a969abfda.pem',
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
      const response = await postAction().send(JSON.stringify(messageBody));

      expect(response.statusCode).toEqual(200);
      expect(response.body.length).toEqual(1);
    });
    it('with verification message', async () => {
      const response = await postAction().send(
        JSON.stringify(verificationBody),
      );

      expect(response.statusCode).toEqual(200);
      expect(response.body.message).toEqual('Verify OK');
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
        JSON.stringify({ ...messageBody, Type: null }),
      );

      expect(response.statusCode).toEqual(400);
    });
  });
});
