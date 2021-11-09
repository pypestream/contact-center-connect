# Add new service

To add new service you need to follow these steps:

* [Add new service to CCC sdk](#add-new-service-to-sdk)
* [Expose service from ccc sdk](#expose-service-from-ccc-sdk)
* [Add new service to getAgentService](#add-new-service-to-getAgentService)
* [Use new service in CCC app](#use-new-service-in-ccc-app)

## Add new service to SDK 

Each new service should implement these interfaces based on external service design

### Service interface - mandatory
```ts
// /lib/sdk/src/services/common/interfaces/service.ts

/**
 * Service should implement this interface for core features interface
 *
 */
export interface Service<T, Y, Z> {
  /**
   * Send message to service
   * @param message
   */
  sendMessage(message: CccMessage): Promise<AxiosResponse<SendMessageResponse>>;

  /**
   * Start new conversation with initial message
   * @param message
   */
  startConversation(
    message: CccMessage
  ): Promise<AxiosResponse<SendMessageResponse>>;

  /**
   * End conversation
   * @param conversationId
   */
  endConversation(conversationId: string): Promise<AxiosResponse<any>>;

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(
    body: T,
    params: { conversationId: string; messageId: string; index: number }
  ): CccMessage;

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
```

### GenericWebhookInterpreter interface - optional

```ts
// /lib/sdk/src/services/common/interfaces/generic-webhook-interpreter.ts

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
```

## Expose service from ccc sdk

* In `Ccc` class you should define service configurations and pass it service object

```ts
// lib/sdk/src/ccc.ts

  constructor(config: SdkConfig) {
    this._config = config;
    if (config.newService) {
      this._newService = new NewService(
        config.ccc,
        config.newService
      );
    }
    require("axios-debug-log/enable");
  }
```

* Then define getter to expose it from ccc sdk

```ts
// lib/sdk/src/ccc.ts

  get newServiceService() {
    return this._newServiceService;
  }
```

## Add new service to getAgentService
based on request headers return service instance

e.g. ServiceNow

```ts
// /Users/noursammour/WebstormProjects/contact-center-pro/lib/sdk/src/services/common/types/agent-services.ts

  getAgentService(req): ServiceNowService {
    const base64Customer = req.headers["x-pypestream-customer"];
    const stringifyCustomer = Buffer.from(base64Customer, "base64").toString(
      "ascii"
    );
    const configs = JSON.parse(stringifyCustomer);
    const integrationName = req.headers["x-pypestream-integration"];
    if (integrationName === "ServiceNow") {
      return new ServiceNowService({
        instanceUrl: configs.instanceUrl,
      });
    }
    return null;
  }
```