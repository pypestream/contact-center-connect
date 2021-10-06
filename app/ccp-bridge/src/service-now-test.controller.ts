import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageType, SendMessageResponse } from '@ccp/sdk';

@Controller('service-now-test')
export class ServiceNowTestController {
  constructor(private readonly appService: AppService) {}

  // for testing, we should remove it later
  @Get('/c/:conversationId/m/:messageId/start-conversation')
  async getStartConversation(
    @Param('conversationId') conversationId,
    @Param('messageId') messageId,
  ): Promise<any> {
    const sendMessageRes =
      await this.appService.serviceNowService.startConversation({
        conversationId: conversationId,
        skill: 'arabic',
        message: {
          id: messageId,
          value: 'it is new conversation....',
          type: MessageType.Text,
        },
        sender: {
          email: 'test9@test.com',
          username: 'username9',
        },
      });
    return sendMessageRes.data;
  }

  // for testing, we should remove it later
  @Get('/c/:conversationId/m/:messageId/send-message')
  async getSendMessage(
    @Param('conversationId') conversationId,
    @Param('messageId') messageId,
  ): Promise<SendMessageResponse> {
    const sendMessageRes = await this.appService.serviceNowService.sendMessage({
      conversationId: conversationId,
      skill: 'arabic',
      message: {
        id: messageId,
        value: 'new message received',
        type: MessageType.Text,
      },
      sender: {
        email: 'test9@test.com',
        username: 'username9',
      },
    });
    return sendMessageRes.data;
  }

  // for testing, we should remove it later
  @Get('/c/:conversationId/end-conversation')
  async getEndConversation(
    @Param('conversationId') conversationId,
  ): Promise<SendMessageResponse> {
    const sendMessageRes =
      await this.appService.serviceNowService.endConversation(conversationId);
    return sendMessageRes.data;
  }

  // for testing, we should remove it later
  @Get('/c/:conversationId/typing')
  async getTyping(
    @Param('conversationId') conversationId,
  ): Promise<SendMessageResponse> {
    const sendMessageRes = await this.appService.serviceNowService.sendTyping(
      conversationId,
      true,
    );
    return sendMessageRes.data;
  }

  // for testing, we should remove it later
  @Get('/c/:conversationId/viewing')
  async getViewing(
    @Param('conversationId') conversationId,
  ): Promise<SendMessageResponse> {
    const sendMessageRes = await this.appService.serviceNowService.sendTyping(
      conversationId,
      false,
    );
    return sendMessageRes.data;
  }
}
