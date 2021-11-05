// add this to your setupFilesAfterEnv config in jest so it's imported for every test file
import { server } from './server';

beforeAll(() =>
  server.listen({
    onUnhandledRequest: ({ headers, method, url }) => {
      if (headers.get('User-Agent') !== 'supertest') {
        throw new Error(`Unhandled ${method} request to ${url}`);
      }
    },
  }),
);
// if you need to add a handler after calling setupServer for some specific test
// this will remove that handler for the rest of them
// (which is important for test isolation):
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
