"use client";

import React from 'react';
import { Reports } from '@/components/reports/Reports';
import { useActiveBusiness } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface ReportsContentProps {
  activeBusiness?: Business | null;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({ activeBusiness }) => {
  // Use context if no prop is provided (for backward compatibility)
  const { activeBusiness: contextBusiness } = useActiveBusiness();
  const business = activeBusiness || contextBusiness;
  
  if (!business) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }

  return (
    <Reports business={business} />
  );
};