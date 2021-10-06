/**
 * Service should implement this interface when it use 1 webhook for all actions
 */

export interface ServiceWebhookHasActions<T> {
  hasChatEndedAction(message: T): boolean;
  hasNewMessageAction(message: T): boolean;
  hasTypingIndicatorAction(message: T): boolean;
  hasWaitTime(message: T): boolean;
}
