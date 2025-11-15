"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { ActiveBusinessProvider } from '@/contexts/ActiveBusinessContext';
import type { Business } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
  businesses: Business[];
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  businesses 
}) => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [activeBusinessId, setActiveBusinessId] = useState<string>('');
  
  // Initialize activeBusinessId properly
  useEffect(() => {
    if (businesses.length > 0 && !activeBusinessId) {
      // For admins, default to first business
      if (currentUser?.role === 'ADMIN') {
        setActiveBusinessId(businesses[0].id);
      } 
      // For managers, default to first business they manage
      else if (currentUser?.role === 'MANAGER' && currentUser.managedBusinessIds?.length) {
        // Find first managed business in the businesses list
        const firstManagedBusiness = businesses.find(b => 
          currentUser.managedBusinessIds?.includes(b.id)
        );
        if (firstManagedBusiness) {
          setActiveBusinessId(firstManagedBusiness.id);
        } else {
          // Fallback to first business if no managed business found
          setActiveBusinessId(businesses[0].id);
        }
      }
    }
  }, [businesses, currentUser, activeBusinessId]);

  const activeBusiness = useMemo(() => {
    if (!currentUser || businesses.length === 0 || !activeBusinessId) return null;

    const currentActiveBusiness = businesses.find(b => b.id === activeBusinessId);
    
    // For admins, allow access to any business but default to first business
    if (currentUser.role === 'ADMIN') {
      return currentActiveBusiness || businesses[0] || null;
    }
    
    // For managers, ensure they can only access businesses they manage
    if (currentUser.role === 'MANAGER' && currentActiveBusiness && currentUser.managedBusinessIds?.includes(currentActiveBusiness.id)) {
       return currentActiveBusiness;
    }
   
    // Default to first business they manage
    const firstManagedId = currentUser.managedBusinessIds?.[0];
    return businesses.find(b => b.id === firstManagedId) || businesses[0] || null;
  }, [businesses, activeBusinessId, currentUser]);

  const lowStockProducts = useMemo((): any[] => {
    if (!activeBusiness) return [];
    return activeBusiness.products?.filter((p: any) => p.stock < 10) || [];
  }, [activeBusiness]);

  const managedBusinesses = useMemo(() => {
    if (!currentUser) return [];
    
    // Admins can manage all businesses
    if (currentUser.role === 'ADMIN') {
      return businesses;
    }
    
    // Managers can only manage businesses they're assigned to
    return businesses.filter((b: any) => currentUser.managedBusinessIds?.includes(b.id));
  }, [currentUser, businesses]);

  const handleLogout = () => {
    // Call the logout function from AuthContext
    logout();
    // Redirect to login page
    router.push('/login');
  };

  // Si l'utilisateur n'est pas connecté, le rediriger vers la page de login
  if (!currentUser) {
    router.push('/login');
    return null; // Retourne null pendant la redirection
  }

  // Create a wrapper component that passes the business prop
  const renderChildrenWithBusiness = () => {
    return React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        // @ts-ignore - We know that the child is a ReactElement
        return React.cloneElement(child, { activeBusiness });
      }
      return child;
    });
  };

  return (
    <ActiveBusinessProvider activeBusiness={activeBusiness} setActiveBusinessId={setActiveBusinessId}>
      <Sidebar currentUser={currentUser} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentUser={currentUser as any} 
          businesses={managedBusinesses}
          activeBusiness={activeBusiness}
          setActiveBusinessId={setActiveBusinessId}
          onLogout={handleLogout}
          lowStockProducts={lowStockProducts}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {renderChildrenWithBusiness()}
        </main>
      </div>
    </ActiveBusinessProvider>
  );
};