import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class HomepageController {
  @Get('')
  @Render('homepage')
  async homepage() {
    return {};
  }
}
