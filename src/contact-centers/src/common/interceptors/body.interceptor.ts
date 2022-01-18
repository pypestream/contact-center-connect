import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as getRawBody from 'raw-body';
import * as qs from 'querystring';
import { Observable } from 'rxjs';

@Injectable()
export class BodyInterceptor implements NestInterceptor {
  public async intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    // changing request
    const request = _context.switchToHttp().getRequest();
    const rawBody = await getRawBody(request);
    const stringifyBody = rawBody.toString();
    if (
      request.headers['content-type'] === 'application/x-www-form-urlencoded'
    ) {
      request.body = qs.parse(stringifyBody);
    } else {
      const body = stringifyBody ? JSON.parse(stringifyBody) : null;
      request.body = body;
    }
    return next.handle();
  }
}
