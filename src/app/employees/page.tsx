"use client";

import React from 'react';
import { Employees } from '@/components/employees/Employees';
import { MainLayout } from '@/components/layout/MainLayout';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/useUser';
import { useBusinesses } from '@/hooks/useBusiness';

export default function EmployeesPage() {
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  
  if (isUsersLoading || isBusinessesLoading) {
    return (
        <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
   <div className="flex items-center space-x-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-gray-800">Employés</p>
          <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
        </div>
      </div>
    </div>
    );
  }
  
  const handleAddUser = async (newUser: any) => {
    try {
      await createUser(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };
  
  const handleUpdateUser = async (updatedUser: any) => {
    try {
      await updateUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Employees 
          users={users} 
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          allBusinesses={businesses} 
        />
      </div>
    </MainLayout>
  );
}