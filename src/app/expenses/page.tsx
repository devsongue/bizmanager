"use client";

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ExpensesContent } from '@/components/expenses/ExpensesContent';
import { useBusinesses } from '@/hooks/useBusiness';

export default function ExpensesPage() {
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  
  if (isBusinessesLoading) {
    return (
        <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
   <div className="flex items-center space-x-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-gray-800">Dépenses</p>
          <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
        </div>
      </div>
    </div>
    );
  }
  
  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <ExpensesContent />
      </div>
    </MainLayout>
  );
}
