import React, { useState } from 'react';
import type { User, UserRole, UserStatus } from '@/types';
import { Button } from '../shared/Button';
import { useUsers, useUpdateUser } from '@/hooks/useUser';
import { Eye, User as UserIcon, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { EmployeeProfile } from './EmployeeProfile';

interface EmployeeManagerProps {
  businessId: string;
  assignedEmployees: User[];
  onAssignEmployee: (employeeId: string) => void;
  onRemoveEmployee: (employeeId: string) => void;
  onClose: () => void;
}

export const EmployeeManager: React.FC<EmployeeManagerProps> = ({
  businessId,
  assignedEmployees,
  onAssignEmployee,
  onRemoveEmployee,
  onClose
}) => {
  const { data: allUsers = [], isLoading } = useUsers();
  const updateUserMutation = useUpdateUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);

  // Filtrer les utilisateurs selon le terme de recherche
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier si un employé est déjà assigné à cette entreprise
  const isEmployeeAssigned = (employeeId: string) => {
    return assignedEmployees.some(emp => emp.id === employeeId);
  };

  // Obtenir la date d'affectation d'un employé
  const getAssignmentDate = (employeeId: string) => {
    // Dans une vraie application, cette information serait stockée dans la base de données
    // Pour cette démonstration, nous retournons une date simulée
    return new Date().toISOString();
  };

  // Obtenir le statut de l'employé en français
  const getUserStatus = (status: UserStatus | undefined | null) => {
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

  // Obtenir le rôle de l'employé en français
  const getUserRole = (role: UserRole) => {
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

  // Assigner un employé
  const handleAssignEmployee = async (employee: User) => {
    try {
      // Mettre à jour les managedBusinessIds de l'employé
      const currentBusinessIds = employee.managedBusinessIds || [];
      const updatedBusinessIds = [...currentBusinessIds, businessId];
      
      await updateUserMutation.mutateAsync({
        id: employee.id,
        data: {
          managedBusinessIds: updatedBusinessIds
        }
      });
      
      onAssignEmployee(employee.id);
    } catch (error) {
      console.error('Erreur lors de l\'assignation de l\'employé:', error);
      alert('Erreur lors de l\'assignation de l\'employé');
    }
  };

  // Retirer un employé
  const handleRemoveEmployee = async (employeeId: string) => {
    try {
      const employee = allUsers.find(user => user.id === employeeId);
      if (employee) {
        // Mettre à jour les managedBusinessIds de l'employé
        const currentBusinessIds = employee.managedBusinessIds || [];
        const updatedBusinessIds = currentBusinessIds.filter(id => id !== businessId);
        
        await updateUserMutation.mutateAsync({
          id: employee.id,
          data: {
            managedBusinessIds: updatedBusinessIds
          }
        });
        
        onRemoveEmployee(employeeId);
      }
    } catch (error) {
      console.error('Erreur lors du retrait de l\'employé:', error);
      alert('Erreur lors du retrait de l\'employé');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-xl">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Gestion des employés
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Assigner ou retirer des employés à cette entreprise
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {selectedEmployee ? (
            // Vue détaillée de l'employé
            <EmployeeProfile
              employee={selectedEmployee}
              isAssigned={isEmployeeAssigned(selectedEmployee.id)}
              assignmentDate={isEmployeeAssigned(selectedEmployee.id) ? getAssignmentDate(selectedEmployee.id) : undefined}
              onBack={() => setSelectedEmployee(null)}
              onAssign={() => handleAssignEmployee(selectedEmployee)}
              onRemove={() => handleRemoveEmployee(selectedEmployee.id)}
            />
          ) : (
            // Liste des employés
            <>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Rechercher un employé..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                      {assignedEmployees.length} employé{assignedEmployees.length > 1 ? 's' : ''} assigné{assignedEmployees.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Employé
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Statut
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            Aucun employé trouvé
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const isAssigned = isEmployeeAssigned(user.id);
                          
                          return (
                            <tr 
                              key={user.id} 
                              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => setSelectedEmployee(user)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <img 
                                    className="h-10 w-10 rounded-full" 
                                    src={user.avatarUrl || '/default-avatar.png'} 
                                    alt={user.name} 
                                  />
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                      {user.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {getUserRole(user.role)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  user.status === 'ACTIVE' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {getUserStatus(user.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedEmployee(user);
                                    }}
                                    className="p-2"
                                    aria-label="Voir le profil"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {isAssigned ? (
                                    <Button
                                      variant="danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveEmployee(user.id);
                                      }}
                                      disabled={updateUserMutation.isPending}
                                      className="p-2"
                                      aria-label="Retirer"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  ) : (
                                    <Button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAssignEmployee(user);
                                      }}
                                      disabled={updateUserMutation.isPending}
                                      className="p-2"
                                      aria-label="Assigner"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};