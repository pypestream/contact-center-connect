import { AgentServices } from '../common/types';
import { ServiceNowService } from '../service-now/service-now.service';
import { GenesysService } from '../genesys/genesys.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';

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
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
  ) {}

  getAgentService(): AgentServices {
    const integrationName = this.request.headers['x-pypestream-integration'];
    if (!integrationName) {
      throw new HttpException(
        'x-pypestream-integration header is null',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (integrationName === 'ServiceNow') {
      return this.serviceNowService;
    }

    if (integrationName === 'Genesys') {
      return this.genesysService;
    }

    return null;
  }
}
