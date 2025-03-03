import { sign, verify } from 'hono/jwt'
import { JWTPayload } from '../types';

// Generate JWT tokens
export async function generateTokens(userId: number, email: string, env: Env) {

  const now = Math.floor(Date.now() / 1000);

  const payload: JWTPayload = {
    userId,
    email,
    nbf: now,
    iat: now,
    exp: now + parseInt(env.ACCESS_TOKEN_EXPIRY),
  };

  // console.log('token payload: ', payload);

  const accessToken = await sign(
    payload,
    env.ACCESS_TOKEN_SECRET,
  );
  payload.exp = now + parseInt(env.REFRESH_TOKEN_EXPIRY);

  // console.log('refresh token payload: ', payload);

  const refreshToken = await sign(
    payload,
    env.REFRESH_TOKEN_SECRET,
  );

  return { accessToken, refreshToken };
}

// Verify JWT token
export async function verifyToken(token: string, secret: string) {
  try {
    // TODO: check if `verify` is controlling the `exp` and `iat` fields
    return await verify(token, secret);
  } catch (error) {
    return null;
  }
}