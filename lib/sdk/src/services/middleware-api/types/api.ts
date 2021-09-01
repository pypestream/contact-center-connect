/*eslint-disable */

export interface Responses {}

export interface Available {
  type: string;
}

export interface EstimatedWaitTime {
  description: string;
  type: string;
}

export interface HoursOfOperation {
  description: string;
  type: string;
}

export interface QueueDepth {
  description: string;
  type: string;
}

export interface Status {
  description: string;
  type: string;
}

export interface Properties {
  available: Available;
  estimatedWaitTime: EstimatedWaitTime;
  hoursOfOperation: HoursOfOperation;
  queueDepth: QueueDepth;
  status: Status;
}

export interface AgentAvailability {
  properties: Properties;
  required: string[];
  type: string;
}

export interface Items {
  $ref: string;
}

export interface Errors {
  items: Items;
  type: string;
}

export interface Message {
  type: string;
}

export interface Properties2 {
  errors: Errors;
  message: Message;
}

export interface BadRequest {
  properties: Properties2;
  required: string[];
  type: string;
}

export interface SenderId {
  format: string;
  type: string;
}

export interface Properties3 {
  senderId: SenderId;
}

export interface End {
  properties: Properties3;
  required: string[];
  type: string;
}

export interface Message2 {
  type: string;
}

export interface Source {
  type: string;
}

export interface Type {
  type: string;
}

export interface Properties4 {
  message: Message2;
  source: Source;
  type: Type;
}

export interface Error {
  properties: Properties4;
  required: string[];
  type: string;
}

export interface Skill {
  type: string;
}

export interface UserId {
  format: string;
  type: string;
}

export interface Properties5 {
  skill: Skill;
  userId: UserId;
}

export interface Escalate {
  properties: Properties5;
  required: string[];
  type: string;
}

export interface AgentId {
  format: string;
  type: string;
}

export interface EscalationId {
  format: string;
  type: string;
}

export interface EstimatedWaitTime2 {
  description: string;
  type: string;
}

export interface QueuePosition {
  description: string;
  type: string;
}

export interface Status2 {
  description: string;
  type: string;
}

export interface Properties6 {
  agentId: AgentId;
  escalationId: EscalationId;
  estimatedWaitTime: EstimatedWaitTime2;
  queuePosition: QueuePosition;
  status: Status2;
}

export interface EscalateResponse {
  properties: Properties6;
  required: string[];
  type: string;
}

export interface Items2 {
  $ref: string;
}

export interface Messages {
  items: Items2;
  type: string;
}

export interface Page {
  type: string;
}

export interface TotalPages {
  type: string;
}

export interface Properties8 {
  page: Page;
  totalPages: TotalPages;
}

export interface Pagination {
  properties: Properties8;
  required: string[];
  type: string;
}

export interface Properties7 {
  messages: Messages;
  pagination: Pagination;
}

export interface History {
  properties: Properties7;
  required: string[];
  type: string;
}

export interface Message3 {
  type: string;
}

export interface Properties9 {
  message: Message3;
}

export interface InternalError {
  properties: Properties9;
  required: string[];
  type: string;
}

export interface Content {
  type: string;
}

export interface SenderId2 {
  description: string;
  format: string;
  type: string;
}

export interface Side {
  description: string;
  type: string;
}

export interface Properties10 {
  content: Content;
  senderId: SenderId2;
  side: Side;
}

export interface Message4 {
  properties: Properties10;
  required: string[];
  type: string;
}

export interface Content2 {
  type: string;
}

export interface SenderId3 {
  description: string;
  format: string;
  type: string;
}

export interface SentDate {
  format: string;
  type: string;
}

export interface Side2 {
  description: string;
  type: string;
}

export interface Properties11 {
  content: Content2;
  senderId: SenderId3;
  sentDate: SentDate;
  side: Side2;
}

export interface MessageSent {
  properties: Properties11;
  required: string[];
  type: string;
}

export interface CallbackToken {
  format: string;
  type: string;
}

export interface CallbackURL {
  format: string;
  type: string;
}

export interface Properties13 {}

export interface IntegrationFields {
  properties: Properties13;
  type: string;
}

export interface IntegrationName {
  type: string;
}

export interface Properties12 {
  callbackToken: CallbackToken;
  callbackURL: CallbackURL;
  integrationFields: IntegrationFields;
  integrationName: IntegrationName;
}

export interface Setting {
  properties: Properties12;
  required: string[];
  type: string;
}

export interface Typing2 {
  type: string;
}

export interface Properties14 {
  typing: Typing2;
}

export interface Typing {
  properties: Properties14;
  required: string[];
  type: string;
}

export interface EstimatedWaitTime3 {
  description: string;
  type: string;
}

export interface Properties15 {
  estimatedWaitTime: EstimatedWaitTime3;
}

export interface WaitTime {
  properties: Properties15;
  required: string[];
  type: string;
}

export interface Schemas {
  AgentAvailability: AgentAvailability;
  BadRequest: BadRequest;
  End: End;
  Error: Error;
  Escalate: Escalate;
  EscalateResponse: EscalateResponse;
  History: History;
  InternalError: InternalError;
  Message: Message4;
  MessageSent: MessageSent;
  Setting: Setting;
  Typing: Typing;
  WaitTime: WaitTime;
}

export interface CoreTokenHeader {
  in: string;
  name: string;
  type: string;
}

export interface TokenHeader {
  in: string;
  name: string;
  type: string;
}

export interface SecuritySchemes {
  CoreTokenHeader: CoreTokenHeader;
  TokenHeader: TokenHeader;
}

export interface Components {
  responses: Responses;
  schemas: Schemas;
  securitySchemes: SecuritySchemes;
}

export interface Contact {
  email: string;
}

export interface Info {
  contact: Contact;
  description: string;
  termsOfService: string;
  title: string;
  version: string;
}

export interface Callbacks {}

export interface Schema {
  type: string;
}

export interface Parameter {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: Schema;
}

export interface Schema2 {
  $ref: string;
}

export interface ApplicationJson {
  schema: Schema2;
}

export interface Content3 {
  "application/json": ApplicationJson;
}

export interface _2002 {
  content: Content3;
  description: string;
}

export interface Schema3 {
  $ref: string;
}

export interface ApplicationJson2 {
  schema: Schema3;
}

export interface Content4 {
  "application/json": ApplicationJson2;
}

export interface _4002 {
  content: Content4;
  description: string;
}

export interface Schema4 {
  $ref: string;
}

export interface ApplicationJson3 {
  schema: Schema4;
}

export interface Content5 {
  "application/json": ApplicationJson3;
}

export interface _5002 {
  content: Content5;
  description: string;
}

export interface Responses2 {
  200: _2002;
  400: _4002;
  500: _5002;
}

export interface Security {
  CoreTokenHeader: any[];
}

export interface Get {
  callbacks: Callbacks;
  deprecated: boolean;
  operationId: string;
  parameters: Parameter[];
  responses: Responses2;
  security: Security[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1AgentsAvailability {
  get: Get;
}

export interface Callbacks2 {}

export interface Schema5 {
  type: string;
}

export interface Parameter2 {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: Schema5;
}

export interface Schema6 {
  $ref: string;
}

export interface ApplicationJson4 {
  schema: Schema6;
}

export interface Content6 {
  "application/json": ApplicationJson4;
}

export interface _2003 {
  content: Content6;
  description: string;
}

export interface Schema7 {
  $ref: string;
}

export interface ApplicationJson5 {
  schema: Schema7;
}

export interface Content7 {
  "application/json": ApplicationJson5;
}

export interface _4003 {
  content: Content7;
  description: string;
}

export interface Schema8 {
  $ref: string;
}

export interface ApplicationJson6 {
  schema: Schema8;
}

export interface Content8 {
  "application/json": ApplicationJson6;
}

export interface _5003 {
  content: Content8;
  description: string;
}

export interface Responses3 {
  200: _2003;
  400: _4003;
  500: _5003;
}

export interface Security2 {
  CoreTokenHeader: any[];
}

export interface Get2 {
  callbacks: Callbacks2;
  deprecated: boolean;
  operationId: string;
  parameters: Parameter2[];
  responses: Responses3;
  security: Security2[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1AgentsWaitTime {
  get: Get2;
}

export interface Callbacks3 {}

export interface Schema9 {
  format: string;
  type: string;
}

export interface Parameter3 {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: Schema9;
}

export interface Schema10 {
  $ref: string;
}

export interface ApplicationJson7 {
  schema: Schema10;
}

export interface Content9 {
  "application/json": ApplicationJson7;
}

export interface RequestBody {
  content: Content9;
  description: string;
  required: boolean;
}

export interface _2042 {
  description: string;
}

export interface Schema11 {
  $ref: string;
}

export interface ApplicationJson8 {
  schema: Schema11;
}

export interface Content10 {
  "application/json": ApplicationJson8;
}

export interface _4004 {
  content: Content10;
  description: string;
}

export interface Schema12 {
  $ref: string;
}

export interface ApplicationJson9 {
  schema: Schema12;
}

export interface Content11 {
  "application/json": ApplicationJson9;
}

export interface _5004 {
  content: Content11;
  description: string;
}

export interface Responses4 {
  204: _2042;
  400: _4004;
  500: _5004;
}

export interface Security3 {
  TokenHeader: any[];
  CoreTokenHeader: any[];
}

export interface Post {
  callbacks: Callbacks3;
  deprecated: boolean;
  operationId: string;
  parameters: Parameter3[];
  requestBody: RequestBody;
  responses: Responses4;
  security: Security3[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1ConversationsConversationIdEnd {
  post: Post;
}

export interface Callbacks4 {}

export interface Schema13 {
  format: string;
  type: string;
}

export interface Parameter4 {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: Schema13;
}

export interface Schema14 {
  $ref: string;
}

export interface ApplicationJson10 {
  schema: Schema14;
}

export interface Content12 {
  "application/json": ApplicationJson10;
}

export interface RequestBody2 {
  content: Content12;
  description: string;
  required: boolean;
}

export interface Schema15 {
  $ref: string;
}

export interface ApplicationJson11 {
  schema: Schema15;
}

export interface Content13 {
  "application/json": ApplicationJson11;
}

export interface _2012 {
  content: Content13;
  description: string;
}

export interface Schema16 {
  $ref: string;
}

export interface ApplicationJson12 {
  schema: Schema16;
}

export interface Content14 {
  "application/json": ApplicationJson12;
}

export interface _4005 {
  content: Content14;
  description: string;
}

export interface Schema17 {
  $ref: string;
}

export interface ApplicationJson13 {
  schema: Schema17;
}

export interface Content15 {
  "application/json": ApplicationJson13;
}

export interface _5005 {
  content: Content15;
  description: string;
}

export interface Responses5 {
  201: _2012;
  400: _4005;
  500: _5005;
}

export interface Security4 {
  CoreTokenHeader: any[];
}

export interface Post2 {
  callbacks: Callbacks4;
  deprecated: boolean;
  operationId: string;
  parameters: Parameter4[];
  requestBody: RequestBody2;
  responses: Responses5;
  security: Security4[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1ConversationsConversationIdEscalate {
  post: Post2;
}

export interface Callbacks5 {}

export interface Schema18 {
  format: string;
  type: string;
}

export interface Parameter5 {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: Schema18;
}

export interface Schema19 {
  $ref: string;
}

export interface ApplicationJson14 {
  schema: Schema19;
}

export interface Content16 {
  "application/json": ApplicationJson14;
}

export interface _2004 {
  content: Content16;
  description: string;
}

export interface Responses6 {
  200: _2004;
}

export interface Security5 {
  TokenHeader: any[];
}

export interface Get3 {
  callbacks: Callbacks5;
  deprecated: boolean;
  operationId: string;
  parameters: Parameter5[];
  responses: Responses6;
  security: Security5[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1ConversationsConversationIdHistory {
  get: Get3;
}

export interface Callbacks6 {}

export interface Schema20 {
  format: string;
  type: string;
}

export interface Parameter6 {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: Schema20;
}

export interface Schema21 {
  $ref: string;
}

export interface ApplicationJson15 {
  schema: Schema21;
}

export interface Content17 {
  "application/json": ApplicationJson15;
}

export interface RequestBody3 {
  content: Content17;
  description: string;
  required: boolean;
}

export interface _2043 {
  description: string;
}

export interface Schema22 {
  $ref: string;
}

export interface ApplicationJson16 {
  schema: Schema22;
}

export interface Content18 {
  "application/json": ApplicationJson16;
}

export interface _4006 {
  content: Content18;
  description: string;
}

export interface Schema23 {
  $ref: string;
}

export interface ApplicationJson17 {
  schema: Schema23;
}

export interface Content19 {
  "application/json": ApplicationJson17;
}

export interface _5006 {
  content: Content19;
  description: string;
}

export interface Responses7 {
  204: _2043;
  400: _4006;
  500: _5006;
}

export interface Security6 {
  TokenHeader: any[];
  CoreTokenHeader: any[];
}

export interface Put {
  callbacks: Callbacks6;
  deprecated: boolean;
  operationId: string;
  parameters: Parameter6[];
  requestBody: RequestBody3;
  responses: Responses7;
  security: Security6[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1ConversationsConversationIdMessagesMessageId {
  put: Put;
}

export interface Callbacks7 {}

export interface Schema24 {
  format: string;
  type: string;
}

export interface Parameter7 {
  description: string;
  in: string;
  name: string;
  required: boolean;
  schema: Schema24;
}

export interface Schema25 {
  $ref: string;
}

export interface ApplicationJson18 {
  schema: Schema25;
}

export interface Content20 {
  "application/json": ApplicationJson18;
}

export interface RequestBody4 {
  content: Content20;
  description: string;
  required: boolean;
}

export interface _2044 {
  description: string;
}

export interface Schema26 {
  $ref: string;
}

export interface ApplicationJson19 {
  schema: Schema26;
}

export interface Content21 {
  "application/json": ApplicationJson19;
}

export interface _4007 {
  content: Content21;
  description: string;
}

export interface Schema27 {
  $ref: string;
}

export interface ApplicationJson20 {
  schema: Schema27;
}

export interface Content22 {
  "application/json": ApplicationJson20;
}

export interface _5007 {
  content: Content22;
  description: string;
}

export interface Responses8 {
  204: _2044;
  400: _4007;
  500: _5007;
}

export interface Security7 {
  TokenHeader: any[];
  CoreTokenHeader: any[];
}

export interface Post3 {
  callbacks: Callbacks7;
  deprecated: boolean;
  operationId: string;
  parameters: Parameter7[];
  requestBody: RequestBody4;
  responses: Responses8;
  security: Security7[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1ConversationsConversationIdType {
  post: Post3;
}

export interface Callbacks8 {}

export interface Schema28 {
  $ref: string;
}

export interface ApplicationJson21 {
  schema: Schema28;
}

export interface Content23 {
  "application/json": ApplicationJson21;
}

export interface _2005 {
  content: Content23;
  description: string;
}

export interface Schema29 {
  $ref: string;
}

export interface ApplicationJson22 {
  schema: Schema29;
}

export interface Content24 {
  "application/json": ApplicationJson22;
}

export interface _4008 {
  content: Content24;
  description: string;
}

export interface Schema30 {
  $ref: string;
}

export interface ApplicationJson23 {
  schema: Schema30;
}

export interface Content25 {
  "application/json": ApplicationJson23;
}

export interface _5008 {
  content: Content25;
  description: string;
}

export interface Responses9 {
  200: _2005;
  400: _4008;
  500: _5008;
}

export interface Security8 {
  TokenHeader: any[];
}

export interface Get4 {
  callbacks: Callbacks8;
  deprecated: boolean;
  operationId: string;
  parameters: any[];
  responses: Responses9;
  security: Security8[];
  summary: string;
  tags: string[];
}

export interface Callbacks9 {}

export interface Schema31 {
  $ref: string;
}

export interface ApplicationJson24 {
  schema: Schema31;
}

export interface Content26 {
  "application/json": ApplicationJson24;
}

export interface RequestBody5 {
  content: Content26;
  description: string;
  required: boolean;
}

export interface Schema32 {
  $ref: string;
}

export interface ApplicationJson25 {
  schema: Schema32;
}

export interface Content27 {
  "application/json": ApplicationJson25;
}

export interface _2013 {
  content: Content27;
  description: string;
}

export interface Schema33 {
  $ref: string;
}

export interface ApplicationJson26 {
  schema: Schema33;
}

export interface Content28 {
  "application/json": ApplicationJson26;
}

export interface _4009 {
  content: Content28;
  description: string;
}

export interface Schema34 {
  $ref: string;
}

export interface ApplicationJson27 {
  schema: Schema34;
}

export interface Content29 {
  "application/json": ApplicationJson27;
}

export interface _5009 {
  content: Content29;
  description: string;
}

export interface Responses10 {
  201: _2013;
  400: _4009;
  500: _5009;
}

export interface Security9 {
  TokenHeader: any[];
}

export interface Put2 {
  callbacks: Callbacks9;
  deprecated: boolean;
  operationId: string;
  parameters: any[];
  requestBody: RequestBody5;
  responses: Responses10;
  security: Security9[];
  summary: string;
  tags: string[];
}

export interface ContactCenterV1Settings {
  get: Get4;
  put: Put2;
}

export interface Paths {
  "/contactCenter/v1/agents/availability": ContactCenterV1AgentsAvailability;
  "/contactCenter/v1/agents/waitTime": ContactCenterV1AgentsWaitTime;
  "/contactCenter/v1/conversations/{conversationId}/end": ContactCenterV1ConversationsConversationIdEnd;
  "/contactCenter/v1/conversations/{conversationId}/escalate": ContactCenterV1ConversationsConversationIdEscalate;
  "/contactCenter/v1/conversations/{conversationId}/history": ContactCenterV1ConversationsConversationIdHistory;
  "/contactCenter/v1/conversations/{conversationId}/messages/{messageId}": ContactCenterV1ConversationsConversationIdMessagesMessageId;
  "/contactCenter/v1/conversations/{conversationId}/type": ContactCenterV1ConversationsConversationIdType;
  "/contactCenter/v1/settings": ContactCenterV1Settings;
}

export interface Tag {
  description: string;
  name: string;
}

export interface RootObject {
  components: Components;
  info: Info;
  openapi: string;
  paths: Paths;
  security: any[];
  servers: any[];
  tags: Tag[];
}
/*eslint-enable */
