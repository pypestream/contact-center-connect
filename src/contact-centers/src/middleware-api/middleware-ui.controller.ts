import { Controller, Get, Render, Inject } from '@nestjs/common';
import { MiddlewareApiService } from './service';
import { MiddlewareApiToken } from './constants';
import { MiddlewareApi } from './middleware-api';

@Controller()
export class MiddlewareUiController {
  private readonly middlewareApiService: MiddlewareApiService;

  constructor(@Inject(MiddlewareApiToken) middlewareApi: MiddlewareApi) {
    this.middlewareApiService = new MiddlewareApiService(middlewareApi.config);
  }

  @Get('')
  @Render('homepage')
  async homepage() {
    return {};
  }

  @Get('settings')
  @Render('settings')
  async settings() {
    const sendMessageRes = await this.middlewareApiService.getSettings();
    return { message: JSON.stringify(sendMessageRes.data) };
  }
}
