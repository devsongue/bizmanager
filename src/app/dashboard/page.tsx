"use client";

import React from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBusinesses } from '@/hooks/useBusiness';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { data: businesses = [], isLoading } = useBusinesses();
  const { currentUser } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Chargement du tableau de bord...</div>;
  }
  
  // Cette page est maintenant rendue à l'intérieur du MainLayout, 
  // donc elle n'a pas besoin de gérer l'entreprise active elle-même.
  // Le MainLayout s'occupe de gérer l'entreprise active et de la passer au Header.
  
  return (
    <MainLayout businesses={businesses}>
      <DashboardPageContent businesses={businesses} />
    </MainLayout>
  );
}

// Composant séparé pour le contenu de la page
const DashboardPageContent = ({ businesses }: { businesses: any[] }) => {
  const { currentUser } = useAuth();
  
  // Filtrer les entreprises en fonction de l'utilisateur actuel
  let activeBusiness;
  
  if (currentUser?.role === 'Admin') {
    // Pour les administrateurs, utiliser la première entreprise (ou une logique différente si nécessaire)
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
      <Dashboard business={activeBusiness} />
    </div>
  );
};