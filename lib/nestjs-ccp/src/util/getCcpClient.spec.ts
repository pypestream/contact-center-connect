import { Ccp, CcpConfig } from '@ccp/sdk';
import { getCcpClient } from './getCcpClient';

describe('getCcpClient', () => {
  const config: CcpConfig = {
    serviceNow: {
      instanceUrl: '',
    },
  };

  it('should return the ccp client', () => {
    const CcpClient = getCcpClient(config);
    expect(CcpClient).toBeInstanceOf(Ccp);
  });

  it('should return the ccp client with custom options', () => {
    const CcpClient = getCcpClient(config);

    expect(CcpClient).toBeInstanceOf(Ccp);
  });
});
