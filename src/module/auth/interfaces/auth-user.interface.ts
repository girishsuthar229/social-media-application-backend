export interface AuthenticatedUser {
  id: number;
  user_name: string;
  email?: string;
  role: {
    id: number;
    name: string;
  };
}
export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
