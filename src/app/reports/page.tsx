"use client";

import React from 'react';
import { Reports } from '@/components/reports/Reports';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportsPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { currentUser } = useAuth();
  
  if (isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des rapports...</div>;
  }
  
  return (
    <MainLayout businesses={businesses}>
      <ReportsPageContent 
        businesses={businesses} 
        currentUser={currentUser} 
      />
    </MainLayout>
  );
}

// Composant séparé pour le contenu de la page
const ReportsPageContent = ({ 
  businesses, 
  currentUser 
}: { 
  businesses: any[]; 
  currentUser: any; 
}) => {
  // Filtrer les entreprises en fonction de l'utilisateur actuel
  let activeBusiness;
  
  if (currentUser?.role === 'Admin') {
    // Pour les administrateurs, utiliser la première entreprise
    activeBusiness = businesses[0];
  } else if (currentUser?.role === 'Gérant' && currentUser.managedBusinessIds && currentUser.managedBusinessIds.length > 0) {
    // Pour les gérants, utiliser la première entreprise assignée
    activeBusiness = businesses.find(b => b.id === currentUser.managedBusinessIds![0]);
  }
  
  // Si aucune entreprise active n'est trouvée, utiliser la première entreprise disponible
  if (!activeBusiness) {
    activeBusiness = businesses[0];
  }
  
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <Reports business={activeBusiness} />
    </div>
  );
};