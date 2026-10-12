/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
import {
  BadRequestException,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction } from 'express';
import { AccountService } from '../base/accounts/account.service';

const TENANT_HEADER = 'x-tenant-id';

@Injectable()
export class tenancyMiddleware implements NestMiddleware {
  constructor(private readonly masterAccountService: AccountService) {}

  public async use(req: any, res: Response, next: NextFunction): Promise<void> {
    const header = req.headers[TENANT_HEADER] as string;
    if (!header) {
      throw new BadRequestException('Please provide API KEY or SLUG');
    }

    const condition = {} as any;
    if (
      [
        '/auth/login',
        '/auth/social_login',
        '/auth/forget_password',
        '/auth/reset_password',
      ].includes(req.url)
    ) {
      condition.slug = header;
    } else {
      condition.api_key = header;
    }
    const query = [{ slug: header.toLowerCase() }, { api_key: header }];
    const account = await this.masterAccountService.findOne(query);

    if (!account) {
      throw new BadRequestException('Invalid account');
    }

    if (account.status === 'DELETED') {
      throw new BadRequestException('Contact your rubicr admin');
    }

    if (account.status !== 'ACTIVE') {
      throw new BadRequestException('Account not active');
    }
    req.tenantId = `tenent_${account.id}`;
    next();
  }
}

@Injectable()
export class tenancyMiddlewareAdmin implements NestMiddleware {
  constructor() {}

  public async use(req: any, res: any, next: NextFunction): Promise<void> {
    const header = req.headers[TENANT_HEADER] as string;
    if (header) {
      req.tenantId = header;
    }
    next();
  }
}
