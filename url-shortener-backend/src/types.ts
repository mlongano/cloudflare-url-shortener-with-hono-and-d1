export type AuthUser = {
  id: number;
  email: string;
  password: string;
  refresh_token?: string;
}

export type AuthUserId = {
  id: number;
  email: string;
}

export type JWTPayload = {
  userId: number;
  email: string;
  nbf: number;
  iat: number;
  exp: number;
};