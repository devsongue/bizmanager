"use client";

import React from 'react';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface DashboardContentProps {
  activeBusiness?: Business;
}

export const DashboardContent: React.FC<DashboardContentProps> = ({ activeBusiness }) => {
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }
  
  return <Dashboard business={business} />;
};