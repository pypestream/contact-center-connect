import { Ccc } from '../../../ccc';
import { cccToken } from './../constants';
import { createCccProvider } from './create-ccc-provider';

describe('cccProvider', () => {
  const apiKey = 'test';

  describe('when called', () => {
    it('should use the correct token', () => {
      const provider = createCccProvider({
        enableLog: true,
      });
      expect(provider).toHaveProperty('provide', cccToken);
    });

    it('should provide a ccc client', () => {
      const provider = createCccProvider({
        enableLog: true,
      });
      expect(provider).toHaveProperty('useValue');
      expect((provider as any).useValue).toBeInstanceOf(Ccc);
    });
  });
});
