import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import * as getRawBody from 'raw-body';
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
    let body = null;
    try {
      body = JSON.parse(stringifyBody);
    } catch (error) {
      body = Object.fromEntries(new URLSearchParams(stringifyBody).entries());
    }
    request.body = body;
    return next.handle();
  }
}
