import { ServiceNowService } from '../../service-now/service-now.service';
import { GenesysService } from '../../genesys/genesys.service';
import { FreshChatService } from '../../fresh-chat/fresh-chat.service';

export type AgentServices =
  | ServiceNowService
  | GenesysService
  | FreshChatService;
