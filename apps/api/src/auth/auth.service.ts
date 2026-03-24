import { randomUUID } from 'node:crypto';

import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { PublicUser, toPublicUser,UserRecord } from '../users/user.types';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
  ) {}

  async signup(dto: SignupDto): Promise<AuthResponse> {
    const passwordHash = await this.passwordService.hash(dto.password);
    const user = await this.usersService.createUser({
      email: dto.email.toLowerCase(),
      passwordHash,
      displayName: dto.displayName.trim(),
    });

    return this.issueAuthResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const isPasswordValid = await this.passwordService.verify(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    return this.issueAuthResponse(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);
    const isValid = await this.sessionService.validateRefreshToken(
      payload.sub,
      payload.jti,
      dto.refreshToken,
    );

    if (!isValid) {
      throw new UnauthorizedException('유효한 refresh session이 아닙니다.');
    }

    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    await this.sessionService.revokeRefreshToken(payload.sub, payload.jti);

    return this.issueAuthResponse(user);
  }

  async logout(dto: RefreshTokenDto): Promise<{ success: true }> {
    const payload = this.tokenService.verifyRefreshToken(dto.refreshToken);

    await this.sessionService.revokeRefreshToken(payload.sub, payload.jti);

    return { success: true };
  }

  async getCurrentUser(userId: string): Promise<PublicUser> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return toPublicUser(user);
  }

  private async issueAuthResponse(user: UserRecord): Promise<AuthResponse> {
    const refreshTokenId = randomUUID();
    const accessToken = this.tokenService.issueAccessToken(user);
    const refreshToken = this.tokenService.issueRefreshToken(user, refreshTokenId);

    await this.sessionService.storeRefreshToken(
      user.id,
      refreshTokenId,
      refreshToken,
      this.tokenService.getRefreshTokenTtlSeconds(),
    );

    return {
      accessToken,
      refreshToken,
      user: toPublicUser(user),
    };
  }
}
