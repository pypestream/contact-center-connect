import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareApiController } from './middleware-api.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';
import { ServiceNowService } from '@ccp/sdk';

const serviceNowConfig = {
  instanceUrl: 'https://dev78406.service-now.com',
};

const ccpConfig = {
  instanceUrl: 'https://localhost:3000',
};

describe('MiddlewareApiController', () => {
  let middlewareApiController: MiddlewareApiController;
  let spyAppService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MiddlewareApiController],
      imports: [
        CcpModule.forRoot({
          serviceNow: serviceNowConfig,
          ccp: ccpConfig,
        }),
      ],
      providers: [AppService],
    }).compile();

    middlewareApiController = app.get<MiddlewareApiController>(
      MiddlewareApiController,
    );
    spyAppService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return object', () => {
      expect(typeof middlewareApiController.availability({})).toBe('object');
    });

    it('ApiService - should be defined', () => {
      expect(spyAppService).toBeDefined();
      expect(spyAppService.serviceNowService).toBeDefined();
    });
  });

  describe('Send Message to Agent', () => {
    it('Should call send message to agent', async () => {
      const result = new ServiceNowService(ccpConfig, serviceNowConfig);
      const spy = jest
        .spyOn(spyAppService, 'serviceNowService', 'get')
        .mockImplementationOnce(() => result);
      await middlewareApiController.message('conversation-id', 'message-id', {
        content: 'fake message',
        senderId: 'sender-id',
        side: 'agent',
      });
      expect(spy).toHaveBeenCalled();
    });
  });
});
