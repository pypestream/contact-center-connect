import { Injectable } from '@nestjs/common';
import Csp from 'csp';
import { InjectCsp } from './../../src';

@Injectable()
export class AppService {
  public constructor(@InjectCsp() private readonly cspClient: Csp) {
    console.info('Csp client was loaded', this.cspClient);
  }
}
