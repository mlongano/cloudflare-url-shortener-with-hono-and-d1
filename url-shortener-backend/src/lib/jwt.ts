import jwt, { SignOptions } from 'jsonwebtoken';

// Generate JWT tokens
export function generateTokens(env: Env, userId: number, email: string, jwtSecret: string, refreshSecret: string) {

  const accessToken = jwt.sign({ userId, email }, jwtSecret, { expiresIn: env.ACCESS_TOKEN_EXPIRY } as SignOptions);

  const refreshToken = jwt.sign({ userId, email }, refreshSecret, { expiresIn: env.REFRESH_TOKEN_EXPIRY } as SignOptions);

  return { accessToken, refreshToken };
}

// Verify JWT token
export function verifyToken(token: string, secret: string) {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
}