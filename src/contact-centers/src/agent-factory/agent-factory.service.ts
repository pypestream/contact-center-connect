import { AgentServices } from '../common/types';
import { ServiceNowService } from '../service-now/service-now.service';
import { GenesysService } from '../genesys/genesys.service';
import { FlexService } from '../flex/flex.service';
import { LivePersonService } from '../liveperson/liveperson.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';

import { IntegrationName } from '../common/types/agent-services';

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
    private readonly flexService: FlexService,
    private readonly livePersonService: LivePersonService,
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
  ) {}

  getAgentService(): AgentServices {
    const integration = this.request.headers['x-pypestream-integration'];
    if (!integration) {
      throw new HttpException(
        'x-pypestream-integration header is null',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (integration === IntegrationName.ServiceNow) {
      return this.serviceNowService;
    }

    if (integration === IntegrationName.Genesys) {
      return this.genesysService;
    }

    if (integration === IntegrationName.Flex) {
      return this.flexService;
    }

    if (integration === IntegrationName.LivePerson) {
      return this.livePersonService;
    }

    return null;
  }
}
