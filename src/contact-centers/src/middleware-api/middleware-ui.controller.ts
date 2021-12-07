import { Controller, Get, Render } from '@nestjs/common';
import { MiddlewareApiService } from './middleware-api.service';

@Controller()
export class MiddlewareUiController {
  constructor(private readonly middlewareApiService: MiddlewareApiService) {}

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

  @Get('env')
  async env() {
    return {
      MIDDLEWARE_API_TOKEN: process.env.MIDDLEWARE_API_TOKEN,
      MIDDLEWARE_API_URL: process.env.MIDDLEWARE_API_URL,
    };
  }
}
