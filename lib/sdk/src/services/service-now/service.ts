import {
  CcpMessage,
  ContactCenterProConfig,
  MessageType,
  SendMessageResponse,
  ServiceNowConfig,
} from "../common/types";
import { Service, GenericWebhookInterpreter } from "../common/interfaces";
import axios, { AxiosResponse } from "axios";

import { v4 as uuidv4 } from "uuid";
import {
  ServiceNowWebhookBody,
  StartTypingIndicatorType,
  EndTypingIndicatorType,
  StartWaitTimeSpinnerType,
} from "./types";

// eslint-disable-next-line
const axiosRetry = require("axios-retry");

axiosRetry(axios, { retries: 3 });

export class ServiceNowService
  implements
    Service<
      ServiceNowWebhookBody,
      ServiceNowWebhookBody,
      ServiceNowWebhookBody
    >,
    GenericWebhookInterpreter<ServiceNowWebhookBody>
{
  serviceNowConfig: ServiceNowConfig;
  contactCenterProConfig: ContactCenterProConfig;

  url: string;

  constructor(ccpConfig: ContactCenterProConfig, config: ServiceNowConfig) {
    this.serviceNowConfig = config;
    this.contactCenterProConfig = ccpConfig;
    this.url = `${config.instanceUrl}/api/sn_va_as_service/bot/integration`;
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
    const res = await axios.post(this.url, this.getMessageRequestBody(message));

    return res;
  }

  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    const res = await axios.post(
      this.url,
      this.getEndConversationRequestBody(conversationId)
    );

    return res;
  }

  async startConversation(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>> {
    await axios.post(this.url, this.startConversationRequestBody(message));

    const res = await axios.post(
      this.url,
      this.switchToAgentRequestBody(message)
    );
    return res;
  }

  private getTypingRequestBody(conversationId: string, isTyping: boolean) {
    const requestId = uuidv4();

    const res = {
      requestId,
      clientSessionId: conversationId,
      action: isTyping ? "TYPING" : "VIEWING",
      userId: conversationId,
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
    const res = await axios.post(
      this.url,
      this.getTypingRequestBody(conversationId, isTyping)
    );
    return res;
  }

  async sendEnd(
    conversationId: string
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const res = await axios.post(
      this.url,
      this.getEndRequestBody(conversationId)
    );
    return res;
  }

  mapToCcpMessage(
    body: ServiceNowWebhookBody,
    params: { index: number }
  ): CcpMessage {
    const { index } = params;
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

  hasEndConversationAction(message: ServiceNowWebhookBody): boolean {
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

  hasWaitTime(message: ServiceNowWebhookBody): boolean {
    const item: StartWaitTimeSpinnerType = message.body.find((item) => {
      const spinner = item as StartWaitTimeSpinnerType;
      return spinner.spinnerType === "wait_time";
    }) as StartWaitTimeSpinnerType;
    return !!item;
  }

  getWaitTime(message: ServiceNowWebhookBody): string {
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
