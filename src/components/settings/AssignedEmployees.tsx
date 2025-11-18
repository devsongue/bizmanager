import React, { useState } from 'react';
import type { User } from '@/types';
import { Button } from '../shared/Button';
import { Eye, Calendar } from 'lucide-react';
import { EmployeeProfile } from '../employees/EmployeeProfile';

interface AssignedEmployeesProps {
  employees: User[];
  onRemove: (employeeId: string) => void;
  onViewDetails?: (employee: User) => void;
}

export const AssignedEmployees: React.FC<AssignedEmployeesProps> = ({ employees, onRemove, onViewDetails }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun employé assigné</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Aucun employé n'est actuellement assigné à cette entreprise.
        </p>
      </div>
    );
  }

  // Obtenir le rôle de l'employé en français
  const getUserRole = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'MANAGER':
        return 'Manager';
      case 'STAFF':
        return 'Employé';
      default:
        return role;
    }
  };

  // Obtenir le statut de l'employé en français
  const getUserStatus = (status: string | undefined | null) => {
    if (!status) return 'Inconnu';
    
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'DISABLED':
        return 'Désactivé';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {selectedEmployee ? (
        <EmployeeProfile
          employee={selectedEmployee}
          isAssigned={true}
          onBack={() => setSelectedEmployee(null)}
          onRemove={() => {
            onRemove(selectedEmployee.id);
            setSelectedEmployee(null);
          }}
        />
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {employees.map((employee) => (
            <li key={employee.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    className="h-10 w-10 rounded-full" 
                    src={employee.avatarUrl || '/default-avatar.png'} 
                    alt={employee.name} 
                  />
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{employee.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{employee.email}</p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 mr-2">
                        {getUserRole(employee.role)}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        employee.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {getUserStatus(employee.status)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="secondary" 
                    onClick={() => setSelectedEmployee(employee)}
                    className="p-2"
                    aria-label="Voir le profil"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => onRemove(employee.id)}
                    className="px-3 py-1 text-sm"
                  >
                    Retirer
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};