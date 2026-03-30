import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt-access') {}
export class LocalAuthGuard extends AuthGuard('local') {}
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {}
