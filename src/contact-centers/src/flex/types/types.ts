export type FlexWebhookBody = {
  EventType: string;
  InstanceSid?: string;
  Attributes?: string;
  DateCreated?: string;
  Index?: string;
  From?: string;
  MessageSid?: string;
  AccountSid?: string;
  Source?: string;
  ChannelSid?: string;
  ClientIdentity?: string;
  RetryCount?: string;
  Body?: string;
  TaskAttributes?: string;
  TaskReEvaluatedReason?: string;
};
/** Agent close/disable chat
 CreatedBy	system
FriendlyName	PS User
EventType	onChannelUpdate
InstanceSid	IS3d2934585cab4fb59cc75a217bbf676a
Attributes	{"task_sid":"WT8f1915a704d2adb7521106a65bb389b0","from":"PS User","channel_type":"web","status":"INACTIVE","long_lived":false}
DateCreated	2022-01-18T10:33:50.399Z
AccountSid	AC4534e2009d82c43795d4ae005b9b72e4
Source	SDK
ChannelSid	CH0099d1ed04c64630978edd7474d589d4
ClientIdentity	si
RetryCount	0
ChannelType	private
UniqueName	3e1cbb88-cf4c-4ada-8b1e-90640a771d6b
*/
/* Agent close chat completely
EventType	onMemberRemoved
InstanceSid	IS3d2934585cab4fb59cc75a217bbf676a
MemberSid	MBccb7f7b5ba4c4dbe93f32b633bf84e43
Attributes	{"member_type":"agent"}
DateCreated	2022-01-18T10:19:12.401Z
DateRemoved	2022-01-18T10:20:31.731Z
AccountSid	AC4534e2009d82c43795d4ae005b9b72e4
Source	SDK
Reason	LEFT
ChannelSid	CHbbc562cea229499db043c6bae937e803
RoleSid	RLf498cf65cbd748c89d0cd16f86c1fb2b
ClientIdentity	si
RetryCount	0
Identity	si
*/
