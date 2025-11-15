"use client";

import React from 'react';
import { Reports } from '@/components/reports/Reports';
import type { Business } from '@/types';

interface ReportsContentProps {
  activeBusiness?: Business;
}

export const ReportsContent: React.FC<ReportsContentProps> = ({ activeBusiness }) => {
  if (!activeBusiness) {
    return <div className="flex justify-center items-center h-64">Aucune entreprise trouvée.</div>;
  }

  return (
    <Reports business={activeBusiness} />
  );
};