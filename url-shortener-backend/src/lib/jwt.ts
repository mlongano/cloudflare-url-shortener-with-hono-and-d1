import { decode, sign, verify } from 'hono/jwt'


// Generate JWT tokens
export async function generateTokens(userId: number, email: string, env: Env) {

  const payload = {
    userId,
    email,
    exp: Math.floor(Date.now() / 1000) + parseInt(env.ACCESS_TOKEN_EXPIRY),
  }
  console.log('token payload: ', payload);

  const accessToken = await sign(
    payload,
    env.ACCESS_TOKEN_SECRET,
  );
  payload.exp = Math.floor(Date.now() / 1000) + parseInt(env.REFRESH_TOKEN_EXPIRY);
  console.log('refresh token payload: ', payload);

  const refreshToken = await sign(
    payload,
    env.REFRESH_TOKEN_SECRET,
  );

  return { accessToken, refreshToken };
}

// Verify JWT token
export async function verifyToken(token: string, secret: string) {
  try {
    return await verify(token, secret);
  } catch (error) {
    return null;
  }
}