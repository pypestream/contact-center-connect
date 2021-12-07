import { IsArray, IsNotEmpty } from 'class-validator';
import { ServiceNowWebhookBodyItem, Message } from '../types';

export class PostBody {
  requestId: string;
  clientSessionId: string;
  nowSessionId: string;
  message: Message;
  userId: string;
  @IsArray() body: Array<ServiceNowWebhookBodyItem>;
  agentChat: boolean;
  completed: boolean;
  @IsNotEmpty() score: number;

  clientVariables?: any;
}
