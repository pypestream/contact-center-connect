/**
 * Service should implement this interface when external service use 1 endpoint for all webhooks
 * we pass request body as parameter and return boolean for ConversationEnd, NewMessage, TypingIndicator, WaitTime
 */

export interface GenericWebhookInterpreter<T> {
  /**
   * Determine if request body contains EndConversation action
   * @param body
   */
  hasEndConversationAction?(body: T): boolean;
  /**
   * Determine if request body contains NewMessage action
   * @param body
   */
  hasNewMessageAction(body: T): boolean;
  /**
   * Determine if request body contains TypingIndicator action
   * @param body
   */
  hasTypingIndicatorAction?(body: T): boolean;
  /**
   * Determine if request body contains WaitTime action
   * @param body
   */
  hasWaitTime?(body: T): boolean;
}
