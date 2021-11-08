import { Ccc } from '../ccc';
import { SdkConfig } from '../types';
import { getCccClient } from './get-ccc-client';

describe('getCccClient', () => {
  const config: SdkConfig = {
    enableLog: true,
  };

  it('should return the ccc client', () => {
    const CccClient = getCccClient(config);
    expect(CccClient).toBeInstanceOf(Ccc);
  });

  it('should return the ccc client with custom options', () => {
    const CccClient = getCccClient(config);

    expect(CccClient).toBeInstanceOf(Ccc);
  });
});
