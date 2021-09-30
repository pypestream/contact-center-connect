import { Test, TestingModule } from '@nestjs/testing';
import { AgentController } from './agent.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';
import {
  MiddlewareApiConfig,
  MiddlewareApiService,
  ContactCenterProConfig,
} from '@ccp/sdk';

const middlewareApiConfig: MiddlewareApiConfig = {
  instanceUrl: 'https://dev78406.service-now.com',
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
      await agentController.message();
      expect(spy).toHaveBeenCalled();
    });
  });
});
