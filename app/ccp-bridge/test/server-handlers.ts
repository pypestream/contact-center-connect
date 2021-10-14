// server-handlers.js
// this is put into here so I can share these same handlers between my tests
// as well as my development in the browser. Pretty sweet!

import { rest } from 'msw'; // msw supports graphql too!

const handlers = [
  rest.post(
    'https://mock-server.service-now.com/api/sn_va_as_service/bot/integration',
    async (req, res, ctx) => {
      // do whatever other things you need to do with this shopping cart
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
      // do whatever other things you need to do with this shopping cart
      return res(
        ctx.json({
          status: 'success',
        }),
      );
    },
  ),
];

export { handlers };
