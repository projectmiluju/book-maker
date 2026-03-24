export type AuthenticatedUser = {
  userId: string;
  email: string;
};

export type TokenType = 'access' | 'refresh';

export type AccessTokenPayload = {
  sub: string;
  email: string;
  type: 'access';
};

export type RefreshTokenPayload = {
  sub: string;
  email: string;
  type: 'refresh';
  jti: string;
};
