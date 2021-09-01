import { Injectable } from '@nestjs/common';
import Ccp from 'ccp';
import { InjectCcp } from './../../src';

@Injectable()
export class AppService {
  public constructor(@InjectCcp() private readonly ccpClient: Ccp) {
    console.info('Ccp client was loaded', this.ccpClient);
  }
}
