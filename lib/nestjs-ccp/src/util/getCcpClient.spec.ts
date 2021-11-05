import { Ccp } from '../ccp';
import { SdkConfig } from '../types';
import { getCcpClient } from './getCcpClient';

describe('getCcpClient', () => {
  const config: SdkConfig = {
    enableLog: true,
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
