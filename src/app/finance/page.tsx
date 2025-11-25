import React from 'react';
import DailyFinancialFlow from '@/components/finance/DailyFinancialFlow';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { SessionPayload } from '@/types';

// Fonction pour obtenir la session utilisateur côté serveur
async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const verifiedToken = await verifySessionToken(token);
    if (verifiedToken.success && verifiedToken.payload) {
      const payload = verifiedToken.payload as SessionPayload;
      return {
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export default async function FinancePage() {
  const session = await getServerSession();
  
  // Vérifier si l'utilisateur est connecté
  if (!session) {
    redirect('/login');
  }
  
  // Vérifier si l'utilisateur a le rôle d'administrateur
  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DailyFinancialFlow />
    </div>
  );
}