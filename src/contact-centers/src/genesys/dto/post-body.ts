import { IsArray, IsNotEmpty, IsObject } from 'class-validator';
import { GenesysWebhookBodyItem, Message } from '../types';

export class PostBody {
  requestId: string;
  clientSessionId: string;
  genesysSessionId: string;
  message: Message;
  userId: string;
  @IsArray() body: Array<GenesysWebhookBodyItem>;
  agentChat: boolean;
  completed: boolean;
  @IsNotEmpty() score: number;

  clientVariables?: any;
}
