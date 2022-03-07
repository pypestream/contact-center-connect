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
    'https://events.launchdarkly.com/diagnostic',
    async (req, res, ctx) => {
      // Uncomment to reference the original response inside the mock
      // const originalResponse = await ctx.fetch(req)

      // intentionally not returning anything here so MSW uses the original response
      return;
    },
  ),
  rest.get('https://stream.launchdarkly.com/all', async (req, res, ctx) => {
    // Uncomment to reference the original response inside the mock
    // const originalResponse = await ctx.fetch(req)

    // intentionally Not returning anything here so MSW uses the original response
    return;
  }),
];

export { handlers };
