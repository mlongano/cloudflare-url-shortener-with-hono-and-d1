export interface AuthUser {
  id: number;
  email: string;
  password: string;
  refresh_token?: string;
}