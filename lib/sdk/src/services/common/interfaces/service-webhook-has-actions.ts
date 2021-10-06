export interface ServiceWebhookHasActions<T> {
  hasChatEndedAction(message: T): boolean;
  hasNewMessageAction(message: T): boolean;
  hasTypingIndicatorAction(message: T): boolean;
  hasWaitTime(message: T): boolean;
}
