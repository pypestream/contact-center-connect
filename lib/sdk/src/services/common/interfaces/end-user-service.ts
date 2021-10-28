import { Request } from "express";
import { AgentServices } from "../types";

/**
 * Service should implement this interface for core features interface
 *
 */
export interface EndUserService {
  /**
   * Send message to service
   * @param message
   */
  getAgentService(req: Request): AgentServices;
}
