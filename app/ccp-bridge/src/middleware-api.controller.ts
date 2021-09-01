import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SendMessageResponse } from '@ccp/sdk';

@Controller('middleware-api')
export class MiddlewareApiController {
  constructor(private readonly appService: AppService) {}

  @Get('settings/save')
  async sendToAgent(): Promise<SendMessageResponse> {
    const sendMessageRes = await this.appService.middlewareApiService.putSettings(
      this.appService.config.middlewareApi.token,
      {
        callbackToken: 'abc',
        callbackURL: this.appService.config.ccp.instanceUrl,
        integrationName: 'ServiceNow',
        integrationFields: {},
      },
    );
    return sendMessageRes;
  }
}

// node app => module => sdk
