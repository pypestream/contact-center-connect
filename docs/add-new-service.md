# Add new service

To add new service you need to follow these steps:

* [Add new service to CCC](#add-new-service-to-ccc)
* [Implement Interfaces](#implement-interfaces)
* [Add new service to AgentServices type](#add-new-service-to-Agentservices-type)
* [Use new service in CCC app](#add-new-service-to-getagentservice)
  

## Add new service to CCC 
In `/src/contact-centers/src` add new folder for your new service

## Implement Interfaces

Each new service should implement these interfaces based on external service design

#### Service interface - mandatory
```ts
// /src/contact-centers/src/common/interfaces/service.ts

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

#### GenericWebhookInterpreter interface - optional

```ts
// /src/contact-centers/src/common/interfaces/generic-webhook-interpreter.ts

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

## Add new service to AgentServices type

in `/src/contact-centers/src/agent-factory/agent-factory.service.ts`
based on request return service instance

e.g. ServiceNow

```ts
// /src/contact-centers/src/agent-factory/agent-factory.service.ts

import { AgentServices } from '../common/types';
import { ServiceNowService } from '../service-now/service-now.service';
import { GenesysService } from '../genesys/genesys.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';

/**
 * MiddlewareApi service
 */
@Injectable({
  scope: Scope.REQUEST,
})
export class AgentFactoryService {
  constructor(
    private readonly serviceNowService: ServiceNowService,
    private readonly genesysService: GenesysService,
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
  ) {}

  getAgentService(): AgentServices {
    const integrationName = this.request.headers['x-pypestream-integration'];
    if (!integrationName) {
      throw new HttpException(
        'x-pypestream-integration header is null',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (integrationName === 'ServiceNow') {
      return this.serviceNowService;
    }

    if (integrationName === 'Genesys') {
      return this.genesysService;
    }

    return null;
  }
}

```