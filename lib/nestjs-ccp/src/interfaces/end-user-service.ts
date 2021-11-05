import { Request } from 'express';
import { AgentServices, EndUserServices } from '../types';

/**
 * End User Service should implement this interface for core features interface
 *
 */
export interface EndUserService {
  /**
   * Send message to service
   * @param message
   */
  getAgentService(req: Request, endUserService: EndUserServices): AgentServices;
}
