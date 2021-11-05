import { Ccp } from '../ccp';
import { ccpToken } from './../constants';
import { createCcpProvider } from './createCCPProvider';

describe('ccpProvider', () => {
  const apiKey = 'test';

  describe('when called', () => {
    it('should use the correct token', () => {
      const provider = createCcpProvider({
        enableLog: true,
      });
      expect(provider).toHaveProperty('provide', ccpToken);
    });

    it('should provide a ccp client', () => {
      const provider = createCcpProvider({
        enableLog: true,
      });
      expect(provider).toHaveProperty('useValue');
      expect((provider as any).useValue).toBeInstanceOf(Ccp);
    });
  });
});
