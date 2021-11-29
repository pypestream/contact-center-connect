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
];

export { handlers };
