"use server";

import { createSessionToken, setSessionCookie } from '@/lib/auth';
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
    
    return { success: true, data: authResult.data };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'An error occurred during login' };
  }
}

// Logout action
export async function logout(): Promise<ActionResult<{ message: string }>> {
  try {
    // In a real implementation, you might want to invalidate the token
    // For now, we'll just return success
    return { success: true, data: { message: 'Logged out successfully' } };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'An error occurred during logout' };
  }
}