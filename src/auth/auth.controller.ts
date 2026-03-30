import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Request } from 'express';
import { CreateUserDto } from 'src/ dtos/create-user.dto';
import { JwtAuthGuard, LocalAuthGuard, RefreshAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    const { user, token } = await this.authService.register(createUserDto);
    return {
      message: 'user registerd',
      data: {
        email: user.email,
        username: user.username,
        role: user.role,
        token,
      },
    };
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: Request) {
    const user = req.user;
    const { accessToken, refreshToken } = await this.authService.login(user);
    return {
      message: 'user logged in',
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req: Request) {
    return req.user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request) {
    await this.authService.logout(req.user);
    return {
      message: 'user logged out',
    };
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: any) {
    const refreshToken = req.headers.authorization.split(' ')[1];
    const userId = req.user.sub;
    const { accessToken, refreshToken: refresh } =
      await this.authService.refreshTokens(userId, refreshToken);
    return {
      message: 'token refreshed successfully',
      data: {
        accessToken,
        refreshToken: refresh,
      },
    };
  }
}
