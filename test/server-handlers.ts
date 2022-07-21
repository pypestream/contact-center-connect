// server-handlers.js
// this is put into here so I can share these same handlers between my tests
// as well as my development in the browser. Pretty sweet!

import { rest } from 'msw'; // msw supports graphql too!

const handlers = [
  rest.post(
    'https://mock-server.service-now.com/api/sn_va_as_service/bot/integration',
    async (req, res, ctx) => {
      if (req.body['action'] === 'AGENT') {
        const contextVariables: any = req.body['contextVariables'];
        const { language, liveagent_deviceType } = contextVariables;
        if (!language || liveagent_deviceType || !req.body['emailId']) {
          ctx.status(301);
        }
      }
      return res(
        ctx.json({
          status: 'success',
        }),
      );
    },
  ),

  rest.post(
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/messages/:messageId',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          status: 'success',
        }),
      );
    },
  ),
  rest.post(
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/escalate',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          status: 'success',
        }),
      );
    },
  ),
  rest.post(
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/type',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          status: 'success',
        }),
      );
    },
  ),
  rest.post(
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/end',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          status: 'success',
        }),
      );
    },
  ),
  rest.put(
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/messages/:messageId',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          status: 'success',
        }),
      );
    },
  ),
  rest.put(
    'https://mock-server.middleware.com/contactCenter/v1/settings',
    async (req, res, ctx) => {
      return res(ctx.json(req.body));
    },
  ),
  rest.get(
    'https://mock-server.middleware.com/contactCenter/v1/settings',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          callbackToken: 'abc',
          callbackURL: 'http://my-computer.ngrok.com',
          integrationName: 'ServiceNow',
          integrationFields: {},
        }),
      );
    },
  ),
  rest.get(
    'https://mock-server.middleware.com/contactCenter/v2/conversations/:conversationId/history',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          messages: [
            {
              content: 'string',
              id: 'string',
              senderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              sentDate: '2021-11-12T10:11:33.194Z',
              side: 'string',
            },
          ],
          pagination: {
            page: 0,
            totalPages: 0,
          },
        }),
      );
    },
  ),
  rest.get(
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/metadata',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          agent: {},
          bot: {
            email: 'undefined',
            extra_data: 'undefined',
            phone: 'undefined',
          },
          user: {
            browser_language: 'en-US,en;q=0.9,ar;q=0.8',
            first_name: '',
            ip_address: 'DoNotTrack',
            last_name: 'Visitor',
            last_viewed_url:
              'https://web.claybox.usa.pype.engineering/preview.html?id=61e48f75-eac8-41c0-8319-66811e3e575e',
            passthrough: '',
            platform: 'Mac OS X10_15_7',
            referring_site: 'https://platform.claybox.usa.pype.engineering/',
            screen_resolution: '1920 x 1080',
            user_browser: 'Chrome 101.0.4951.64',
          },
        }),
      );
    },
  ),
  rest.patch(
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/metadata',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          agent: {},
          bot: {
            email: 'undefined',
            extra_data: 'undefined',
            phone: 'undefined',
          },
          user: {
            browser_language: 'en-US,en;q=0.9,ar;q=0.8',
            first_name: '',
            ip_address: 'DoNotTrack',
            last_name: 'Visitor',
            last_viewed_url:
              'https://web.claybox.usa.pype.engineering/preview.html?id=61e48f75-eac8-41c0-8319-66811e3e575e',
            passthrough: '',
            platform: 'Mac OS X10_15_7',
            referring_site: 'https://platform.claybox.usa.pype.engineering/',
            screen_resolution: '1920 x 1080',
            user_browser: 'Chrome 101.0.4951.64',
          },
        }),
      );
    },
  ),
  rest.post(
    'https://login.usw2.pure.cloud/oauth/token',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          access_token:
            'VmtYTtTPZEHxZAhSqgEvAuZeipBxwtp8nA5cXw_1tQtYEHB-bOkF0so1zhpm9dZ6ZQLE-_yuEdCsOtP3CFGVuA',
          token_type: 'bearer',
          expires_in: 86399,
        }),
      );
    },
  ),
  rest.post(
    'https://api.usw2.pure.cloud/api/v2/conversations/messages/inbound/open',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          id: '3577b4520d4c24242016305b769c4f51',
          channel: {
            id: 'a2171742-7359-41cf-aa68-ad5049250806',
            platform: 'Open',
            type: 'Private',
            to: { id: 'a94dea17-a20c-4f0e-9169-73a9f0e9669f' },
            from: {
              nickname: 'PS testing OM Integration',
              id: 'a2171742-7359-41cf-aa68-ad5049250806',
              idType: 'Opaque',
            },
            time: '2021-11-29T08:19:16.026Z',
            messageId: '3577b4520d4c24242016305b769c4f51',
          },
          type: 'Text',
          text: 'hello',
          originatingEntity: 'Human',
          direction: 'Outbound',
        }),
      );
    },
  ),
  rest.post(
    'https://api.usw2.pure.cloud/api/v2/notifications/channels',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          connectUri:
            'wss://streaming.usw2.pure.cloud/channels/streaming-4-ukr8up4nma82lhpci5kd2mi86t',
          id: 'streaming-4-ukr8up4nma82lhpci5kd2mi86t',
          expires: '2021-12-02T13:20:18.968Z',
        }),
      );
    },
  ),
  rest.post(
    'https://api.usw2.pure.cloud/api/v2/analytics/queues/observations/query',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          results: [
            {
              group: {
                queueId: '464c104b-7375-4bd2-b9d3-047b18d66ccf',
              },
              data: [
                {
                  metric: 'oOnQueueUsers',
                  qualifier: 'INTERACTING',
                  stats: {
                    count: 4,
                  },
                },
              ],
            },
          ],
        }),
      );
    },
  ),
  rest.get(
    'https://api.usw2.pure.cloud/api/v2/conversations/messages/:id/details',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          conversationId: 'random-conversation-id',
        }),
      );
    },
  ),
  rest.patch(
    'https://api.usw2.pure.cloud/api/v2/conversations/messages/:conversationId',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          participants: [],
          state: 'disconnected',
        }),
      );
    },
  ),
  rest.post(
    'https://api.usw2.pure.cloud/api/v2/notifications/channels/streaming-4-ukr8up4nma82lhpci5kd2mi86t/subscriptions',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          entities: [
            {
              id: 'v2.routing.queues.0c54f616-50d6-43a0-9373-ecda0dc0f69c.conversations',
            },
          ],
        }),
      );
    },
  ),
  rest.post(
    'https://login.usw2.pure.cloud/oauth/token',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          access_token:
            'RxmaDSoqnKwh3q-kPJ3bAeciqqBIQmDecFyJ5ls34PQ9-lu3k6kK7Dzv33f3_2xeTvGo45uu8TZqFRsbK5tz1g',
          token_type: 'bearer',
          expires_in: 86399,
        }),
      );
    },
  ),
  rest.post(
    'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf673s/Channels/:conversationId/Messages',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          body: 'Hey there',
          index: 2,
          channel_sid: 'CH42a90a7ddc474001981797db3b1e30c8',
          from: 'PS User',
          date_updated: '2022-04-20T08:09:51Z',
          type: 'text',
          account_sid: 'AC4534e2009d82c43795d4ae005b9b13aa',
          to: 'CH42a90a7ddc474001981797db3b1e30c8',
          last_updated_by: null,
          date_created: '2022-04-20T08:09:51Z',
          media: null,
          sid: 'IMe1e770d917f74937aaac12fe87594b47',
          url: 'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf676a/Channels/CH42a90a7ddc474001981797db3b1e30c8/Messages/IMe1e770d917f74937aaac12fe87594b47',
          attributes: '{}',
          service_sid: 'IS3d2934585cab4fb59cc75a217bbf676a',
          was_edited: false,
        }),
      );
    },
  ),
  rest.post(
    'https://flex-api.twilio.com/v1/Channels',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          task_sid: 'WT5290e5945996343ed86d5c94b019eac5',
          flex_flow_sid: 'FO7cfba21cbaa988e7d8d71ee0f4d41ec0',
          account_sid: 'AC4534e2009d82c43795d4ae005b9bae91',
          user_sid: 'USb31ceb7d19134e6a83d4e47c413300dc',
          url: 'https://flex-api.twilio.com/v1/Channels/CH5e435e9bee814c0f852f998b93c747be',
          date_updated: '2022-04-05T12:25:09Z',
          sid: 'CH5e435e9bee814c0f852f998b93c747be',
          date_created: '2022-04-05T12:25:09Z',
        }),
      );
    },
  ),
  rest.post(
    'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf673s/Channels/CH5e435e9bee814c0f852f998b93c747be',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          unique_name: 'conv-2254',
          members_count: 1,
          date_updated: '2022-04-05T12:27:01Z',
          friendly_name: 'PS User',
          created_by: 'system',
          account_sid: 'AC4534e2009d82c43795d4ae005b9b7c12',
          url: 'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf676a/Channels/CH5e435e9bee814c0f852f998b93c747be',
          date_created: '2022-04-05T12:25:09Z',
          sid: 'CH5e435e9bee814c0f852f998b93c747be',
          attributes:
            '{"task_sid":"WT5290e5945996343ed86d5c94b019eac5","from":"PS User","channel_type":"web","status":"ACTIVE","long_lived":false}',
          service_sid: 'IS3d2934585cab4fb59cc75a217bbf676a',
          type: 'private',
          messages_count: 0,
          links: {
            webhooks:
              'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf676a/Channels/CH5e435e9bee814c0f852f998b93c747be/Webhooks',
            messages:
              'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf676a/Channels/CH5e435e9bee814c0f852f998b93c747be/Messages',
            invites:
              'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf676a/Channels/CH5e435e9bee814c0f852f998b93c747be/Invites',
            members:
              'https://chat.twilio.com/v2/Services/IS3d2934585cab4fb59cc75a217bbf676a/Channels/CH5e435e9bee814c0f852f998b93c747be/Members',
            last_message: null,
          },
        }),
      );
    },
  ),
  rest.post(
    'https://connect.us-east-1.amazonaws.com/metrics/current/e3ef3a3f-2af5-4556-8e01-90bbxxdf3334',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          DataSnapshotTime: 1657289943,
          MetricResults: [
            {
              Collections: [
                {
                  Metric: { Name: 'AGENTS_AVAILABLE', Unit: 'COUNT' },
                  Value: 1,
                },
              ],
            },
          ],
        }),
      );
    },
  ),
  rest.post(
    'https://participant.connect.us-east-1.amazonaws.com/participant/connection',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          $metadata: {
            httpStatusCode: 200,
            requestId: 'dbd92aff-266c-44d4-8e60-59a161216469',
            attempts: 1,
            totalRetryDelay: 0,
          },
          ConnectionCredentials: {
            ConnectionToken:
              'QVFJREFIamh2WWE1U0t5UnV6bElTRXIxTnZPMFRtaUk5Ky91UjFKWk0vWHdQMWRXcVFIUU11b0ZTczduczJLT0RseVNKcGhtQUFBQWJqQnNCZ2txaGtpRzl3MEJCd2FnWHpCZEFnRUFNRmdHQ1NxR1NJYjNEUUVIQVRBZUJnbGdoa2dCWlFNRUFTNHdFUVFNejVxYlkrZmFrWS8rY0RaVEFnRVFnQ3ROelNDREVlWmRUejRkeFlZbzdpVDdndWxDQzJIT3Zab1oyRm4zQ3RNQUdvaXBLcG1UTkZ4eGlBQ0M6OjA0Uk1CN1NmanFlQTNyZmg4OTc5RElOVm5ob05TK2NHUG9OSUZDeDBZUlArOU9WWklaT0dzdG9Cd2tTeFNKWGV6QjNSN1B4N2JwN1FKcTh1ZnVOM2I4UDQybC9TOEFXNWZIZ0gwcU1KNmN4NUNhQzlObDc5RlFEOEdudE0zVXNTMm40NEZPMGtESy9Ob2t3V2Q1TnJsaTBSbFdEaUZwZnlVcE13dmNWZjNpb1dxaURmSUVDOHMzMXZ6MWFFVFNyRmtKeC9YT2Z0ckRGYjhGNldyVzVDS1FVa2w0UXh4MUpVOTBUcG15aVB6cS9INnRuUUE3UjRsejIxeHBUMko1R1duSU1vUUZzMlBtcGFJOExrNUNibmtYbjE=',
            Expiry: '2022-07-09T12:13:36.048Z',
          },
        }),
      );
    },
  ),
  rest.post(
    'https://connect.us-east-1.amazonaws.com/contact/start-streaming',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          StreamingId: 'e13f4afd-8f9e-4052-97b9-3b138318b8df',
        }),
      );
    },
  ),
  rest.post(
    'https://participant.connect.us-east-1.amazonaws.com/participant/message',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          AbsoluteTime: '2022-07-08T12:16:00.047Z',
          Id: 'e13f4afd-8f9e-4052-97b9-3b138318b8df',
        }),
      );
    },
  ),
  rest.put(
    'https://connect.us-east-1.amazonaws.com/contact/chat',
    async (req, res, ctx) => {
      return res(
        ctx.json({
          $metadata: {
            httpStatusCode: 200,
            requestId: 'e13f4afd-8f9e-4052-97b9-3b138318b8df',
            extendedRequestId: undefined,
            cfId: undefined,
            attempts: 1,
            totalRetryDelay: 0,
          },
          AbsoluteTime: '2022-07-08T12:16:00.047Z',
          Id: 'b1804e7d-4dab-4060-a772-143d671d846c',
        }),
      );
    },
  ),
];

export { handlers };
