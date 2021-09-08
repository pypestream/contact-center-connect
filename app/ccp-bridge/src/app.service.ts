import { Injectable } from '@nestjs/common';
import { Ccp } from '@ccp/sdk';
import { InjectCcp } from '@ccp/nestjs-module';

@Injectable()
export class AppService {
  public constructor(@InjectCcp() private readonly ccpClient: Ccp) {}

  get serviceNowService() {
    return this.ccpClient.serviceNowService;
  }

  get middlewareApiService() {
    return this.ccpClient.middlewareApiService;
  }

  get config() {
    return this.ccpClient.config;
  }
}
