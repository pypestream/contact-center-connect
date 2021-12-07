import { IsNotEmpty } from 'class-validator';
import { GenesysChannel } from '../types';

export class PostBody {
  @IsNotEmpty() id: string;
  channel: GenesysChannel;
  type: string;
  text?: string;
  originatingEntity?: string;
  direction: string;
  status?: string;
}
