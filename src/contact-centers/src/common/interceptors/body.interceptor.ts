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
    const body = stringifyBody ? JSON.parse(stringifyBody) : null;
    request.body = body;
    return next.handle();
  }
}
