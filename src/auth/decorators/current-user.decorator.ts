import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentUserType {
  sub: string;
  email?: string;
  username?: string;
  role: string;
  refreshToken?: string;
}

export const CurrentUser = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const user = req.user as CurrentUserType;
    return { userid: user.sub, role: user.role };
  },
);
