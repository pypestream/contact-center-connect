import { Csp, CspConfig } from '@csp/sdk';
import { getCspClient } from './getCspClient';

describe('getCspClient', () => {
  const config: CspConfig = {
    serviceNow: {
      instanceUrl: '',
      apiKey: '',
    },
  };

  it('should return the csp client', () => {
    const CspClient = getCspClient(config);
    expect(CspClient).toBeInstanceOf(Csp);
  });

  it('should return the csp client with custom options', () => {
    const CspClient = getCspClient(config);

    expect(CspClient).toBeInstanceOf(Csp);
  });
});
