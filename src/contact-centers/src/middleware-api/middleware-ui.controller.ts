import { Controller, Get, Render, Inject } from '@nestjs/common';
import { MiddlewareApiService } from './service';
import { cccToken } from '../common/constants';
import { Ccc } from '../../ccc';

@Controller()
export class MiddlewareUiController {
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
