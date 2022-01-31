import { IsNotEmpty } from 'class-validator';
import { Actor, Data } from '../types';

export class PostBody {
  @IsNotEmpty()
  actor: Actor;
  @IsNotEmpty()
  action: string;
  action_time: Date;
  @IsNotEmpty()
  data: Data;
}
