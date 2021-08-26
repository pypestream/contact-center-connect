import {Csp} from '@csp/sdk';
import { cspToken } from './../constants';
import { createCspProvider } from './createCspProvider';

describe('cspProvider', () => {
  const apiKey = 'test';

  describe('when called', () => {
    it('should use the correct token', () => {
      const provider = createCspProvider({ services: [] });
      expect(provider).toHaveProperty('provide', cspToken);
    });

    it('should provide a csp client', () => {
      const provider = createCspProvider({ services: [] });
      expect(provider).toHaveProperty('useValue');
      expect((provider as any).useValue).toBeInstanceOf(Csp);
    });
  });
});
