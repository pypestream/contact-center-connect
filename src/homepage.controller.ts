import { Controller, Get, Render, Inject } from '@nestjs/common';
import { MiddlewareApiService } from './contact-centers/src/middleware-api/service';
import { cccToken } from './contact-centers';
import { Ccc } from './contact-centers/ccc';

@Controller()
export class HomepageController {
  private readonly middlewareApiService: MiddlewareApiService;
  constructor(@Inject(cccToken) ccc: Ccc) {
    this.middlewareApiService = new MiddlewareApiService(ccc.middlewareApi);
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
