"use client";

import React from 'react';
import { BusinessDashboard } from '@/components/business/BusinessDashboard';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function BusinessPage() {
  const { data: businesses = [], isLoading } = useBusinesses();
  const { currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  // Check if the current user is authorized to access this business
  const isAuthorized = React.useMemo(() => {
    if (!currentUser || !businessId) return false;
    
    // Admins can access any business
    if (currentUser.role === 'Admin') return true;
    
    // Managers can only access businesses they manage
    if (currentUser.role === 'Gérant') {
      return currentUser.managedBusinessIds?.includes(businessId) || false;
    }
    
    return false;
  }, [currentUser, businessId]);

  // Redirect unauthorized users
  React.useEffect(() => {
    if (!isLoading && businesses.length > 0 && !isAuthorized) {
      // Si l'utilisateur est un gérant mais n'a pas accès à cette entreprise,
      // le rediriger vers la première entreprise à laquelle il a accès
      if (currentUser?.role === 'Gérant' && currentUser.managedBusinessIds && currentUser.managedBusinessIds.length > 0) {
        router.push(`/business/${currentUser.managedBusinessIds[0]}`);
      } else {
        // Pour les autres cas, rediriger vers le tableau de bord
        router.push('/dashboard');
      }
    }
  }, [isAuthorized, isLoading, businesses, router, currentUser]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement de l'entreprise...</div>;
  }

  if (!isAuthorized) {
    return <div className="flex justify-center items-center h-64">Accès non autorisé.</div>;
  }

  const activeBusiness = businesses.find(b => b.id === businessId);

  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Entreprise non trouvée.</div>;
  }

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <BusinessDashboard business={activeBusiness} />
      </div>
    </MainLayout>
  );
}