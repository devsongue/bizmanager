"use server";

import { createSessionToken, setSessionCookie, setAuthTokenCookie } from '@/lib/auth';
import { authenticateUser } from './userActions';
import { ActionResult, SessionPayload } from '@/types';

// Login action
export async function login(email: string, password: string): Promise<ActionResult<unknown>> {
  try {
    // Authenticate user with email and password
    const authResult = await authenticateUser(email, password);
    
    if (!authResult.success) {
      return { success: false, error: authResult.error || 'Invalid credentials' };
    }
    
    // Create session token with user data
    const sessionPayload: SessionPayload = {
      userId: authResult.data.id,
      email: authResult.data.email,
      role: authResult.data.role,
    };
    
    const token = await createSessionToken(sessionPayload);
    
    // Set session cookie
    await setSessionCookie(token);
    
    // Also set the legacy auth-token for backward compatibility
    await setAuthTokenCookie(token);
    
    return { success: true, data: authResult.data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}