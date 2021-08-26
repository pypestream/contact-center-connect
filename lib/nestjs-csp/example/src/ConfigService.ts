import { Injectable } from '@nestjs/common';
import { CspOptions } from './../../src';

@Injectable()
export class ConfigService {
  public getCspConfig(): CspOptions {
    return {
      apiKey: 'secret',
      apiVersion: '2020-03-02',
    };
  }
}
