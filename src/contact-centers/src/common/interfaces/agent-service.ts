import { AxiosResponse } from 'axios';
import { CccMessage, StartConversationResponse } from '../types';
import { publicComponents } from '../../middleware-api/types';

/**
 * Service should implement this interface for core features interface
 *
 */
export interface AgentService {
  /**
   * Start new conversation with initial message
   * @param message
   */
  startConversation(
    message: CccMessage,
    metadata?: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<StartConversationResponse>>;
}
