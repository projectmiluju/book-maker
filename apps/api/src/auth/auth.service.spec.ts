import { UnauthorizedException } from '@nestjs/common';

import { UserRecord } from '../users/user.types';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignupDto } from './dto/signup.dto';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  const user: UserRecord = {
    id: 'user-1',
    email: 'sea@example.com',
    passwordHash: 'hashed-password',
    displayName: '바다',
    createdAt: new Date('2026-03-25T00:00:00.000Z'),
    updatedAt: new Date('2026-03-25T00:00:00.000Z'),
  };

  let usersService: jest.Mocked<UsersService>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let sessionService: jest.Mocked<SessionService>;
  let authService: AuthService;

  beforeEach(() => {
    usersService = {
      createUser: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    passwordService = {
      hash: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<PasswordService>;

    tokenService = {
      issueAccessToken: jest.fn().mockReturnValue('access-token'),
      issueRefreshToken: jest.fn().mockReturnValue('refresh-token'),
      verifyAccessToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
      getRefreshTokenTtlSeconds: jest.fn().mockReturnValue(1209600),
    } as unknown as jest.Mocked<TokenService>;

    sessionService = {
      storeRefreshToken: jest.fn(),
      validateRefreshToken: jest.fn(),
      revokeRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<SessionService>;

    authService = new AuthService(
      usersService,
      passwordService,
      tokenService,
      sessionService,
    );
  });

  it('hashes the password before creating a user on signup', async () => {
    passwordService.hash.mockResolvedValue('hashed-password');
    usersService.createUser.mockResolvedValue(user);

    const result = await authService.signup({
      email: 'SEA@example.com',
      password: 'password123',
      displayName: ' 바다 ',
    } satisfies SignupDto);

    expect(passwordService.hash.mock.calls).toContainEqual(['password123']);
    expect(usersService.createUser.mock.calls).toContainEqual([
      {
        email: 'sea@example.com',
        passwordHash: 'hashed-password',
        displayName: '바다',
      },
    ]);
    expect(sessionService.storeRefreshToken.mock.calls).toHaveLength(1);
    expect(result.user.email).toBe('sea@example.com');
  });

  it('rejects login when the password does not match', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    passwordService.verify.mockResolvedValue(false);

    await expect(
      authService.login({
        email: user.email,
        password: 'wrong-password',
      } satisfies LoginDto),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rotates the refresh session on refresh', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: user.id,
      email: user.email,
      type: 'refresh',
      jti: 'refresh-1',
    });
    sessionService.validateRefreshToken.mockResolvedValue(true);
    usersService.findById.mockResolvedValue(user);

    const result = await authService.refresh({
      refreshToken: 'refresh-token',
    } satisfies RefreshTokenDto);

    expect(sessionService.revokeRefreshToken.mock.calls).toContainEqual([
      user.id,
      'refresh-1',
    ]);
    expect(sessionService.storeRefreshToken.mock.calls).toHaveLength(1);
    expect(result.accessToken).toBe('access-token');
  });

  it('revokes the refresh session on logout', async () => {
    tokenService.verifyRefreshToken.mockReturnValue({
      sub: user.id,
      email: user.email,
      type: 'refresh',
      jti: 'refresh-logout',
    });

    await expect(
      authService.logout({
        refreshToken: 'refresh-token',
      } satisfies RefreshTokenDto),
    ).resolves.toEqual({ success: true });

    expect(sessionService.revokeRefreshToken.mock.calls).toContainEqual([
      user.id,
      'refresh-logout',
    ]);
  });
});
