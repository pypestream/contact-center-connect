import {
  Controller,
  Post,
  Req,
  Res,
  HttpStatus,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { GenesysService } from './genesys.service';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { GenesysWebhookBody } from './types';
import { Request, Response } from 'express';
import { PostBody } from './dto';
import { Body } from '@nestjs/common';
import { BodyInterceptor } from '../common/interceptors/body.interceptor';
import { GenesysWebsocket } from './genesys.websocket';

@UseInterceptors(BodyInterceptor)
@Controller('genesys')
export class GenesysController {
  constructor(
    private readonly genesysService: GenesysService,
    private readonly genesysWebsocket: GenesysWebsocket,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {}

  @Get('test-websocket')
  async webSocket() {
    await this.genesysWebsocket.addConnection({
      grantType: 'client_credentials',
      clientId: 'cee20b0f-1881-4b8e-bea1-4fa625ec0c72',
      clientSecret: '_pngpQy8CGpF69dVgOlnWZuCwRjGN1EjKqpv-GpAcYQ',
      getTokenUrl: 'https://login.usw2.pure.cloud/oauth/token',
      getChannelUrl:
        'https://api.usw2.pure.cloud/api/v2/notifications/channels',
    });
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

    const requests = [];

    const hasNewMessageAction = this.genesysService.hasNewMessageAction(
      body as GenesysWebhookBody,
    );

    if (hasNewMessageAction) {
      const message = this.genesysService.mapToCccMessage(
        body as GenesysWebhookBody,
      );
      if (message) {
        const sendMessageRequest =
          this.middlewareApiService.sendMessage(message);
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
