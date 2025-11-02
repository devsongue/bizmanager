import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { SessionPayload } from '@/types';

// Secret key for JWT - in production, use environment variables
const secretKey = process.env.AUTH_SECRET || 'default_secret_key_for_development';
const encodedKey = new TextEncoder().encode(secretKey);

// Create a session token
export async function createSessionToken(payload: SessionPayload) {
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .setJti(nanoid())
    .sign(encodedKey);
  
  return token;
}

// Verify a session token
export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, encodedKey);
    // Type assertion after verification
    const sessionPayload = payload as unknown as SessionPayload;
    return { success: true, payload: sessionPayload };
  } catch (error) {
    return { success: false, error };
  }
}

// Set session cookie
export async function setSessionCookie(token: string) {
  (await cookies()).set('session-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'strict',
  });
}

// Get session cookie
export async function getSessionCookie() {
  return (await cookies()).get('session-token')?.value;
}

// Clear session cookie
export async function clearSessionCookie() {
  (await cookies()).delete('session-token');
}