import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MailServiceRq {
  constructor(@Inject('MAIL_SERVICE') private readonly client: ClientProxy) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public send(pattern: string, data: any) {
    return this.client.emit(pattern, data);
  }
}
