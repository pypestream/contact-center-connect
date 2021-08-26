import { Injectable } from '@nestjs/common';
import { Csp } from '@csp/sdk';
import { InjectCsp } from '@csp/nestjs-module';

@Injectable()
export class AppService {
  public constructor(@InjectCsp() private readonly cspClient: Csp) {
    console.info('Csp client was loaded', this.cspClient);
  }

  get serviceNowService() {
    return this.cspClient.serviceNowService;
  }
}
