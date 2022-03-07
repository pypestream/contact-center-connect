import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { MiddlewareApiService } from './middleware-api.service';
import { SettingsObject } from './types';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { FeatureFlagEnum } from '../feature-flag/feature-flag.enum';

@UseInterceptors(BodyInterceptor)
@Controller()
export class MiddlewareUiController {
  constructor(
    private readonly middlewareApiService: MiddlewareApiService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get('')
  @Render('homepage')
  async homepage() {
    return {};
  }

  @Get('settings')
  @Render('settings')
  async settings() {
    try {
      const sendMessageRes = await this.middlewareApiService.getSettings();
      return { message: JSON.stringify(sendMessageRes.data) };
    } catch (ex) {
      return { message: JSON.stringify({}) };
    }
  }

  @Get('feature-flags')
  async flags() {
    const history = await this.featureFlagService.isFlagEnabled(
      FeatureFlagEnum.History,
    );
    const PE_19853 = await this.featureFlagService.isFlagEnabled(
      FeatureFlagEnum.PE_19853,
    );
    const PE_19446 = await this.featureFlagService.isFlagEnabled(
      FeatureFlagEnum.PE_19446,
    );
    const test = await this.featureFlagService.isFlagEnabled(
      FeatureFlagEnum.Test,
    );
    return { history, PE_19853, test, PE_19446 };
  }

  @Post('settings')
  async post(@Body() body, @Res() res) {
    let integrationFields;
    switch (body.integrationName) {
      case 'ServiceNow':
        integrationFields = { instanceUrl: 'string' };
        break;
      case 'Genesys':
        integrationFields = {
          instanceUrl: 'string',
          oAuthUrl: 'string',
          clientId: 'string',
          clientSecret: 'string',
          grantType: 'string',
          OMIntegrationId: 'string',
          OMQueueId: 'string',
        };
    }
    const settings: SettingsObject = {
      callbackToken: 'random-token',
      callbackURL: body.callbackURL,
      integrationName: body.integrationName,
      integrationFields: integrationFields,
    };
    try {
      await this.middlewareApiService.putSettings(settings);
      return res.redirect('/settings');
    } catch (ex) {
      return { error: ex.message };
    }
  }

  @Get('env')
  async env() {
    return {
      MIDDLEWARE_API_TOKEN: process.env.MIDDLEWARE_API_TOKEN,
      MIDDLEWARE_API_URL: process.env.MIDDLEWARE_API_URL,
    };
  }
}
