// server-handlers.js
// this is put into here so I can share these same handlers between my tests
// as well as my development in the browser. Pretty sweet!

import { rest } from 'msw'; // msw supports graphql too!

const handlers = [
  rest.post(
    'https://mock-server.service-now.com/api/sn_va_as_service/bot/integration',
    async (req, res, ctx) => {
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
    'https://mock-server.middleware.com/contactCenter/v1/conversations/:conversationId/history',
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
];

export { handlers };
