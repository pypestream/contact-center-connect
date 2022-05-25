import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Render,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { MiddlewareApiService } from './middleware-api.service';
import { privateComponents, publicComponents, SettingsObject } from './types';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { FeatureFlagEnum } from '../feature-flag/feature-flag.enum';

@UseInterceptors(BodyInterceptor)
@Controller()
export class MiddlewareUiController {
  private readonly logger = new Logger(MiddlewareUiController.name);

  constructor(
    private readonly middlewareApiService: MiddlewareApiService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Get('')
  @Render('homepage')
  async homepage() {
    return {};
  }

  @Get('integrations')
  @Render('integrations')
  async settings() {
    try {
      const sendMessageRes = await this.middlewareApiService.getIntegrations();
      return { message: JSON.stringify(sendMessageRes.data) };
    } catch (ex) {
      return { message: JSON.stringify({}) };
    }
  }

  @Get('ff')
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
    return { history, PE_19853, PE_19446 };
  }

  @Post('integrations')
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
    const integration: publicComponents['schemas']['IntegrationCreate'] = {
      callbackToken: 'random-token',
      callbackURL: body.callbackURL,
      integrationName: body.integrationName,
      integrationFields: integrationFields,
    };
    try {
      await this.middlewareApiService.addIntegration(integration);
      return res.redirect('/integrations');
    } catch (ex) {
      if (ex.response.data.errors) {
        this.logger.error(JSON.stringify(ex.response.data.errors));
        return res.status(HttpStatus.BAD_REQUEST).send(ex.response.data.errors);
      } else {
        this.logger.error(JSON.stringify(ex.message), ex.stack);
        return res.status(HttpStatus.BAD_REQUEST).send(ex.message);
      }
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
