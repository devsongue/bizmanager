"use client";

import React from 'react';
import { Employees } from '@/components/employees/Employees';
import { MainLayout } from '@/components/layout/MainLayout';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUser';
import { useBusinesses } from '@/hooks/useBusiness';

export default function EmployeesPage() {
  const { data: users = [], isLoading: isUsersLoading } = useUsers();
  const { data: businesses = [], isLoading: isBusinessesLoading } = useBusinesses();
  const { mutateAsync: createUser } = useCreateUser();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();
  
  if (isUsersLoading || isBusinessesLoading) {
    return <div className="flex justify-center items-center h-64">Chargement des employés...</div>;
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

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <MainLayout businesses={businesses}>
      <div className="p-4 md:p-8">
        <Employees 
          users={users} 
          onAddUser={handleAddUser}
          onUpdateUser={handleUpdateUser}
          onDeleteUser={handleDeleteUser}
          allBusinesses={businesses} 
        />
      </div>
    </MainLayout>
  );
}