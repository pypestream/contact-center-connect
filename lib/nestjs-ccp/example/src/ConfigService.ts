import { Injectable } from '@nestjs/common';
import { CcpOptions } from './../../src';

@Injectable()
export class ConfigService {
  public getCcpConfig(): CcpOptions {
    return {
      apiKey: 'secret',
      apiVersion: '2020-03-02',
    };
  }
}
