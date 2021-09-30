import {
  CcpMessage,
  ContactCenterProConfig,
  MessageAction,
  MessageType,
  SendMessageResponse,
  Service,
  ServiceNowConfig,
} from "../common/interfaces";
import axis, { AxiosResponse } from "axios";
import { v4 as uuidv4 } from "uuid";
import {
  ServiceNowWebhookBody,
  StartTypingIndicatorType,
  EndTypingIndicatorType,
  StartWaitTimeSpinnerType,
} from "./types";

export class ServiceNowService implements Service<ServiceNowWebhookBody> {
  serviceNowConfig: ServiceNowConfig;
  contactCenterProConfig: ContactCenterProConfig;

  constructor(ccpConfig: ContactCenterProConfig, config: ServiceNowConfig) {
    this.serviceNowConfig = config;
    this.contactCenterProConfig = ccpConfig;
  }

  private getMessageRequestBody(message: CcpMessage) {
    const requestId = uuidv4();
    return {
      requestId,
      clientSessionId: message.conversationId,
      contextVariables: {
        LiveAgent_mandatory_skills: message.skill,
      },
      message: {
        text: message.message.value,
        typed: true,
        clientMessageId: message.message.id,
      },
      userId: message.conversationId,
    };
  }

  private getEndConversationRequestBody(conversationId: string) {
    const res = {
      clientSessionId: conversationId,
      action: "END_CONVERSATION",
      message: {
        text: "",
        typed: true,
      },
      userId: conversationId,
    };
    return res;
  }

  private startConversationRequestBody(message: CcpMessage) {
    const requestId = uuidv4();
    const clientMessageId = uuidv4();
    const res = {
      requestId,
      clientSessionId: message.conversationId,
      action: "AGENT",
      contextVariables: {
        LiveAgent_mandatory_skills: message.skill,
      },
      message: {
        text: "",
        typed: true,
        clientMessageId,
      },
      userId: message.conversationId,
    };
    return res;
  }

  private switchToAgentRequestBody(message: CcpMessage) {
    const requestId = uuidv4();
    const res = {
      requestId,
      clientSessionId: message.conversationId,
      action: "AGENT",
      contextVariables: {
        LiveAgent_mandatory_skills: message.skill,
      },
      message: {
        text: message.message.value,
        typed: true,
        clientMessageId: message.message.id,
      },
      userId: message.conversationId,
    };
    return res;
  }

  async sendMessage(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const res = await axis.post(
      this.serviceNowConfig.instanceUrl +
        "/api/sn_va_as_service/bot/integration",
      this.getMessageRequestBody(message)
    );

    return res;
  }

  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    const res = await axis.post(
      this.serviceNowConfig.instanceUrl +
        "/api/sn_va_as_service/bot/integration",
      this.getEndConversationRequestBody(conversationId)
    );

    return res;
  }

  async startConversation(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>> {
    await axis.post(
      this.serviceNowConfig.instanceUrl +
        "/api/sn_va_as_service/bot/integration",
      this.startConversationRequestBody(message)
    );

    const res = await axis.post(
      this.serviceNowConfig.instanceUrl +
        "/api/sn_va_as_service/bot/integration",
      this.switchToAgentRequestBody(message)
    );
    return res;
  }

  private getTypingRequestBody(conversationId: string, isTyping: boolean) {
    const requestId = uuidv4();
    const messageId = uuidv4();

    const res = {
      requestId,
      clientSessionId: conversationId,
      action: isTyping ? "TYPING" : "VIEWING",
      userId: "agent1",
    };
    return res;
  }

  private getEndRequestBody(conversationId: string) {
    const requestId = uuidv4();

    const res = {
      requestId,
      clientSessionId: conversationId,
      action: "END_CONVERSATION",
    };
    return res;
  }

  async sendTyping(
    conversationId: string,
    isTyping: boolean
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const res = await axis.post(
      this.serviceNowConfig.instanceUrl +
        "/api/sn_va_as_service/bot/integration",
      this.getTypingRequestBody(conversationId, isTyping)
    );
    return res;
  }

  async sendEnd(
    conversationId: string
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const res = await axis.post(
      this.serviceNowConfig.instanceUrl +
        "/api/sn_va_as_service/bot/integration",
      this.getEndRequestBody(conversationId)
    );
    return res;
  }

  mapToCcpMessage(body: ServiceNowWebhookBody, index: number): CcpMessage {
    const item = body.body[index];
    if (item.uiType !== "OutputText") {
      return;
    }
    return {
      message: {
        value: item.value,
        type: MessageType.Text,
      },
      sender: {
        username: item.agentInfo.agentName,
      },
      conversationId: body.clientSessionId,
    };
  }

  hasNewMessageAction(message: ServiceNowWebhookBody): boolean {
    const item = message.body.find(
      (item) =>
        item.uiType === "OutputText" && item.actionType === "DefaultText"
    );
    return !!item;
  }

  hasChatEndedAction(message: ServiceNowWebhookBody): boolean {
    const item = message.body.find(
      (item) => item.uiType === "ActionMsg" && item.actionType === "System"
    );
    return !!item;
  }

  hasTypingIndicatorAction(message: ServiceNowWebhookBody): boolean {
    const item = message.body.some(
      (item: EndTypingIndicatorType | StartTypingIndicatorType) => {
        const isTypingIndicator =
          item.actionType === "EndTypingIndicator" ||
          item.actionType === "StartTypingIndicator";
        return item.uiType === "ActionMsg" && isTypingIndicator;
      }
    );
    return !!item;
  }

  isTyping(message: ServiceNowWebhookBody): boolean {
    type TypingIndicatorType =
      | EndTypingIndicatorType
      | StartTypingIndicatorType;
    const item = message.body.find((item: TypingIndicatorType) => {
      const isTypingIndicator =
        item.actionType === "EndTypingIndicator" ||
        item.actionType === "StartTypingIndicator";
      return item.uiType === "ActionMsg" && isTypingIndicator;
    });
    return (item as TypingIndicatorType).actionType === "StartTypingIndicator";
  }

  isAvailable(skill: string): boolean {
    return !!skill;
  }

  waitTime(message: ServiceNowWebhookBody): string {
    const item: StartWaitTimeSpinnerType = message.body.find((item) => {
      const spinner = item as StartWaitTimeSpinnerType;
      return spinner.spinnerType === "wait_time";
    }) as StartWaitTimeSpinnerType;
    return item.waitTime;
  }

  escalate(): boolean {
    return true;
  }
}
