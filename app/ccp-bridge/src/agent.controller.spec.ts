import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';
import {
  ServiceNowConfig,
  MiddlewareApiConfig,
  MiddlewareApiService,
  ContactCenterProConfig,
} from '@ccp/sdk';

const middlewareApiConfig: MiddlewareApiConfig = {
  instanceUrl: 'https://dev78406.service-now.com',
  token: 'fake token',
};

const serviceNowConfig: ServiceNowConfig = {
  instanceUrl: 'https://dev78406.service-now.com',
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
          serviceNow: serviceNowConfig,
          middlewareApi: middlewareApiConfig,
          ccp: ccpConfig,
        }),
      ],
      providers: [AppService],
    }).compile();

    agentController = app.get<AgentController>(AgentController);
    spyAppService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(agentController.getHello()).toBe('Hello World!');
    });

    it('ApiService - should be defined', () => {
      expect(spyAppService).toBeDefined();
      expect(spyAppService.serviceNowService).toBeDefined();
    });
  });

  describe('Send Message to Agent', () => {
    it('should call send message to agent', async () => {
      const result = new MiddlewareApiService(ccpConfig, middlewareApiConfig);
      const spy = jest
        .spyOn(spyAppService, 'middlewareApiService', 'get')
        .mockImplementationOnce(() => result);
      await agentController.message();
      expect(spy).toHaveBeenCalled();
    });
  });
});
