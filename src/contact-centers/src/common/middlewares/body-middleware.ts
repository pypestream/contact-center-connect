import { Injectable, NestMiddleware } from '@nestjs/common';
import * as getRawBody from 'raw-body';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BodyMiddleware implements NestMiddleware {
  public use(req: Request, res: Response<any>, next: NextFunction): any {
    getRawBody(req, null, (err, rawBody) => {
      if (err) return next(err);
      const stringifyBody = rawBody.toString();
      const body = stringifyBody ? JSON.parse(stringifyBody) : null;

      req.body = body;
      next();
    });
  }
}
