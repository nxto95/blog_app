import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as argon from 'argon2';
import { Roles } from '../users/users.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../ dtos/create-user.dto';

export interface IJwtPayload {
  sub: string;
  role: Roles;
}
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findUserByEmailForAuth(email);
    if (!user) throw new UnauthorizedException('invalid credentials');
    const isPasswordMatch = await argon.verify(user.password, pass);
    if (!isPasswordMatch)
      throw new UnauthorizedException('invalid credentials');
    return user;
  }

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const token = await this.login(user);
    return { user, token };
  }

  async login(user: any) {
    const payload: IJwtPayload = { sub: user._id.toString(), role: user.role };
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);
    await this.usersService.updateRefreshToken(user._id, refreshToken);
    return { accessToken, refreshToken };
  }

  async logout(user: any) {
    const userId = user.sub;
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateAccessToken(payload: IJwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.getOrThrow<any>('JWT_EXPIRY'),
    });
  }
  private async generateRefreshToken(payload: IJwtPayload) {
    return await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<any>('JWT_REFRESH_EXPIRY'),
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findUserByIdForAuth(userId);
    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Access denied');

    const isMatch = await argon.verify(user.refreshToken, refreshToken);
    if (!isMatch) throw new UnauthorizedException('Access denied');

    const payload: IJwtPayload = { sub: user._id.toString(), role: user.role };

    // generate new tokens
    const [accessToken, newRefreshToken] = await Promise.all([
      this.generateAccessToken(payload),
      this.generateRefreshToken(payload),
    ]);

    // store hashed refresh token
    await this.usersService.updateRefreshToken(userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
