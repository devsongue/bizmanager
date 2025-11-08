import React from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// Fonction pour vérifier le token JWT côté serveur
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'fallback-secret-key-change-this');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Fonction pour vérifier l'authentification côté serveur
async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return false;
  }
  
  const payload = await verifyToken(token);
  return !!payload;
}

export default async function HomePage() {
  const authenticated = await isAuthenticated();
  
  // Si l'utilisateur est authentifié, le rediriger vers le tableau de bord
  if (authenticated) {
    redirect('/dashboard');
  }
  
  // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de login
  redirect('/login');
}