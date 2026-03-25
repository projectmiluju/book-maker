export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};
