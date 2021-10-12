import { Ccp } from '@ccp/sdk';
import { ccpToken } from './../constants';
import { createCcpProvider } from './createCcpProvider';

describe('ccpProvider', () => {
  const apiKey = 'test';

  describe('when called', () => {
    it('should use the correct token', () => {
      const provider = createCcpProvider({
        serviceNow: {
          instanceUrl: '',
        },
      });
      expect(provider).toHaveProperty('provide', ccpToken);
    });

    it('should provide a ccp client', () => {
      const provider = createCcpProvider({
        serviceNow: {
          instanceUrl: '',
        },
      });
      expect(provider).toHaveProperty('useValue');
      expect((provider as any).useValue).toBeInstanceOf(Ccp);
    });
  });
});
