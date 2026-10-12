/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminAuthService } from 'src/modules/base/auth/auth.service';
import { env } from '../config';

interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtAdminStrategy extends PassportStrategy(Strategy, 'Admin') {
  constructor(
    @Inject(forwardRef(() => AdminAuthService))
    private adminAuthService: AdminAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.jwt_secret_admin,
    });
  }

  async validate(payload: any) {
    const user = await this.adminAuthService.findOne(payload.id);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class JwtAdminRefreshStrategy extends PassportStrategy(
  Strategy,
  'ADMIN-REFRESH',
) {
  constructor() {
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwt_refresh_admin,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...payload, refreshToken };
  }
}

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, 'JWT') {
  constructor() {
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwt_secret,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(payload: JwtPayload) {
    return payload;
  }
}

@Injectable()
export class JwtAccessRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'JWT-REFRESH',
) {
  constructor() {
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: env.jwt_refresh_secret,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.get('Authorization').replace('Bearer', '').trim();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return { ...payload, refreshToken };
  }
}
