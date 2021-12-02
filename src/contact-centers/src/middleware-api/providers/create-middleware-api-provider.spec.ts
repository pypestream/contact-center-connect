import { MiddlewareApi } from '../middleware-api';
import { MiddlewareApiToken } from './../constants';
import { createMiddlewareApiProvider } from './create-middleware-api-provider';

describe('cccProvider', () => {
  const apiKey = 'test';

  describe('when called', () => {
    it('should use the correct token', () => {
      const provider = createMiddlewareApiProvider({
        url: '',
        token: '',
      });
      expect(provider).toHaveProperty('provide', MiddlewareApiToken);
    });

    it('should provide a ccc client', () => {
      const provider = createMiddlewareApiProvider({
        url: '',
        token: '',
      });
      expect(provider).toHaveProperty('useValue');
      expect((provider as any).useValue).toBeInstanceOf(MiddlewareApi);
    });
  });
});
