import { Controller, Post, Req, Res, HttpStatus } from '@nestjs/common';
import { GenesysService } from './service';
import { GenesysWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';

@Controller('genesys')
export class GenesysController {
  private genesysService: GenesysService;

  constructor() {
    this.genesysService = new GenesysService();
  }

  @Post('webhook')
  async message(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostBody,
  ) {
    if (body.type === 'Receipt') {
      return res.status(HttpStatus.OK).send({ message: 'Receipt' });
    }

    const endUserService = this.genesysService.getEndUserService();

    const requests = [];

    const hasNewMessageAction = this.genesysService.hasNewMessageAction(
      body as GenesysWebhookBody,
    );

    if (hasNewMessageAction) {
      const message = this.genesysService.mapToCccMessage(
        body as GenesysWebhookBody,
      );
      if (message) {
        const sendMessageRequest = endUserService.sendMessage(message);
        requests.push(sendMessageRequest);
      }
    }

    Promise.all(requests)
      .then((responses) => {
        const data = responses.map((r) => r.data);
        return res.status(HttpStatus.OK).send(data);
      })
      .catch((err) => {
        return res.status(HttpStatus.BAD_REQUEST).send(err);
      });
  }
}
