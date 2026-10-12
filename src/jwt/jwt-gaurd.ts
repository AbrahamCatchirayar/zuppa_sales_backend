/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-classes-per-file */
import {
  BadRequestException,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../modules/tenanted/auth/auth.service';

@Injectable()
export class JwtAdminAuthGuard extends AuthGuard('Admin') {}

@Injectable()
export class JwtUserAuthGuard extends AuthGuard('User') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('JWT') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    await super.canActivate(context);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = await this.authService.findOne({ id: request.user.sub });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.status !== 'ACTIVE') {
      throw new BadRequestException('InActive user');
    }

    delete user.refresh_token;
    user.is_guest = false;
    request.user = user;
    return true;
  }
}

@Injectable()
export class JwtAuthRefreshGuard extends AuthGuard('JWT-REFRESH') {}
