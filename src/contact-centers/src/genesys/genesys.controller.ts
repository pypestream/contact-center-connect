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
    const endUserService = this.genesysService.getEndUserService(
      body as GenesysWebhookBody,
    );
    if (!endUserService) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ message: 'Not able to get endUserService' });
    }
    const requests = [];

    const hasChatEndedAction = this.genesysService.hasEndConversationAction(
      body as GenesysWebhookBody,
    );
    if (hasChatEndedAction) {
      const endConversationRequest = await endUserService.endConversation(
        body.clientSessionId,
      );
      requests.push(endConversationRequest);
    }
    const hasNewMessageAction = this.genesysService.hasNewMessageAction(
      body as GenesysWebhookBody,
    );

    if (hasNewMessageAction) {
      for (let i = 0; i < (body as GenesysWebhookBody).body.length; i++) {
        const message = this.genesysService.mapToCccMessage(
          body as GenesysWebhookBody,
          {
            index: i,
          },
        );
        if (message) {
          const sendMessageRequest = endUserService.sendMessage(message);
          requests.push(sendMessageRequest);
        }
      }
    }
    const hasTypingIndicatorAction =
      this.genesysService.hasTypingIndicatorAction(body as GenesysWebhookBody);
    if (hasTypingIndicatorAction) {
      const isTyping = this.genesysService.isTyping(body as GenesysWebhookBody);
      const sendTypingRequest = endUserService.sendTyping(
        body.clientSessionId,
        isTyping,
      );
      requests.push(sendTypingRequest);
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
