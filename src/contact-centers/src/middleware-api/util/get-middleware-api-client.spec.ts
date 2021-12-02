import { MiddlewareApi } from '../middleware-api';
import { MiddlewareApiConfig } from '../types';
import { getMiddlewareApiClient } from './get-middleware-api-client';

describe('getCccClient', () => {
  const config: MiddlewareApiConfig = {
    url: '',
    token: '',
  };

  it('should return the ccc client', () => {
    const CccClient = getMiddlewareApiClient(config);
    expect(CccClient).toBeInstanceOf(MiddlewareApi);
  });

  it('should return the ccc client with custom options', () => {
    const CccClient = getMiddlewareApiClient(config);

    expect(CccClient).toBeInstanceOf(MiddlewareApi);
  });
});
