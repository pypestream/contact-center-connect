# Add new service

Each new service should implement these interfaces based on external service design


### Service - mandatory

````ts
/**
 * Service should implement this interface for core features interface
 *
 */
export interface Service<T,Y,Z> {
  /**
   * Send message to service
   * @param message
   */
  sendMessage(message: CcpMessage): Promise<AxiosResponse<SendMessageResponse>>;

  /**
   * Start new conversation with initial message
   * @param message
   */
  startConversation(
          message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>>;

  /**
   * End conversation
   * @param conversationId
   */
  endConversation(conversationId: string): Promise<AxiosResponse<any>>;

  /**
   * Convert posted body to CCP message
   * @param body
   * @param params
   */
  mapToCcpMessage(
          body: T,
          params: { conversationId: string; messageId: string; index: number }
  ): CcpMessage;

  /**
   * Determine if user/agent is typing or viewing based on request body
   * @param message
   */
  isTyping(body: Y): boolean;

  /**
   * Determine if user/agent is availabe to receive new message
   * @param message
   */
  isAvailable(skill: string): boolean;

  /**
   * Return estmiated waittime in seconds
   * @param message
   */
  getWaitTime(body: Z): string;

  /**
   * Send is typing indicator to service
   * @param conversationId
   * @param isTyping
   */
  sendTyping(
          conversationId: string,
          isTyping: boolean
  ): Promise<AxiosResponse<SendMessageResponse>>;
}

````

### GenericWebhookInterpreter - optional
    
````ts
/**
 * Service should implement this interface when external service use 1 endpoint for all webhooks
 * we pass request body as parameter and return boolean for ConversationEnd, NewMessage, TypingIndicator, WaitTime
 */

export interface GenericWebhookInterpreter<T> {
  /**
   * Determine if request body contains EndConversation action
   * @param body
   */
  hasEndConversationAction(body: T): boolean;
  /**
   * Determine if request body contains NewMessage action
   * @param body
   */
  hasNewMessageAction(body: T): boolean;
  /**
   * Determine if request body contains TypingIndicator action
   * @param body
   */
  hasTypingIndicatorAction(body: T): boolean;
  /**
   * Determine if request body contains WaitTime action
   * @param body
   */
  hasWaitTime(body: T): boolean;
}
````
