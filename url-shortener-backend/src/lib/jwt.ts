import jwt, { SignOptions } from 'jsonwebtoken';

// Generate JWT tokens
export function generateTokens(userId: number, email: string, env: Env) {

  const accessToken = jwt.sign(
    { userId, email },
    env.ACCESS_TOKEN_SECRET,
    { expiresIn: env.ACCESS_TOKEN_EXPIRY } as SignOptions
  );

  const refreshToken = jwt.sign(
    { userId, email },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRY } as SignOptions
  );

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