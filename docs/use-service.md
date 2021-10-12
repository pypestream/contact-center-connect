##User service

To use service in app you should load it on app boot level and then use it any controller action

```ts
    // app/ccsp-bridge/src/app.module.js
    CcpModule.forRoot({
        serviceNowCuso: {
            instanceUrl: 'https://dev50996.service-now.com',
        },
    }),
````
```ts
  @Get('/c/:conversationId/viewing')
  async getViewing(
    @Param('conversationId') conversationId,
  ): Promise<SendMessageResponse> {
    const sendMessageRes = await this.appService.serviceNowService.sendTyping(
      conversationId,
      false,
    );
    return sendMessageRes.data;
  }
  
```
Note: this will be changed later
