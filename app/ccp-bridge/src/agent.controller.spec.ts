import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';
import {
  MiddlewareApiConfig,
  MiddlewareApiService,
  ContactCenterProConfig,
  ServiceNowConfig,
} from '@ccp/sdk';

const serviceNowConfig: ServiceNowConfig = {
  instanceUrl: 'https://mock-server.service-now.com',
};

const middlewareApiConfig: MiddlewareApiConfig = {
  instanceUrl: 'https://mock-server.middleware.com',
  token: 'fake token',
};

const ccpConfig: ContactCenterProConfig = {
  instanceUrl: 'https://localhost:3000',
};

describe('AgentController', () => {
  let agentController: AgentController;
  let spyAppService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AgentController],
      imports: [
        CcpModule.forRoot({
          middlewareApi: middlewareApiConfig,
          ccp: ccpConfig,
          serviceNow: serviceNowConfig,
        }),
      ],
      providers: [AppService],
    }).compile();

    agentController = app.get<AgentController>(AgentController);
    spyAppService = app.get<AppService>(AppService);
  });

  describe('Send Message to Agent', () => {
    it('ApiService - should be defined', () => {
      expect(spyAppService).toBeDefined();
      expect(spyAppService.middlewareApiService).toBeDefined();
    });
    it('should call message action', async () => {
      const result = new MiddlewareApiService(ccpConfig, middlewareApiConfig);
      const spy = jest
        .spyOn(spyAppService, 'middlewareApiService', 'get')
        .mockImplementationOnce(() => result);
      await agentController.message({
        message: {
          clientMessageId: 'abc-123',
          text: 'message',
          typed: true,
        },
        requestId: 'abc-123',
        body: [
          {
            uiType: 'OutputText',
            actionType: 'DefaultText',
            agentInfo: {
              agentAvatar: 'avatar',
              agentName: 'agent',
              sentFromAgent: true,
            },
            value: 'message',
            maskType: 'abc-123',
          },
        ],
        nowSessionId: 'abc-123',
        clientSessionId: 'abc-123',
        agentChat: true,
        completed: true,
        score: 1,
        userId: 'abc-123',
      });
      expect(spy).toHaveBeenCalled();
    });
  });
});
