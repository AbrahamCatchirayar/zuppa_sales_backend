import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserDecorator = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return (request as unknown as { user: { id: string; email: string } })
      .user as { id: string; email: string };
  },
);

export interface IUser {
  id: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  created_by_type: string | null;
  created_by: string | null;
  email: string;
  name: string;
  status: string;
  confirmed_at: string; // ISO 8601 date string
  invitation_token: string | null;
  password_reset_on: string | null;
  invitation_token_sent_at: string | null;
  accept_terms_of_service: boolean;
  forget_password_token: string | null;
  forget_password_token_sent_at: string | null;
  last_login_at: string; // ISO 8601 date string
  blocked_reason: string | null;
  blocked_on: string | null;
  role: string;
  role_access: string;

  account: {
    id: string;
    createdAt: string; // ISO 8601 date string
    updatedAt: string; // ISO 8601 date string
    created_by_type: string | null;
    created_by: string | null;
    name: string;
    slug: string;
    email: string;
    api_key: string;
  };
}
