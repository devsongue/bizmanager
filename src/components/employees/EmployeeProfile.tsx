import React from 'react';
import type { User, UserRole, UserStatus } from '@/types';
import { Button } from '../shared/Button';
import { Calendar, Mail, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';

interface EmployeeProfileProps {
  employee: User;
  onBack: () => void;
  onEdit?: () => void;
  onAssign?: () => void;
  onRemove?: () => void;
  isAssigned?: boolean;
  assignmentDate?: string;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({
  employee,
  onBack,
  onEdit,
  onAssign,
  onRemove,
  isAssigned = false,
  assignmentDate
}) => {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            className="h-16 w-16 rounded-full" 
            src={employee.avatarUrl || '/default-avatar.png'} 
            alt={employee.name} 
          />
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {employee.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {employee.email}
            </p>
          </div>
        </div>
        <Button 
          variant="secondary" 
          onClick={onBack}
          className="flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Retour
        </Button>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Informations de base
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getUserRole(employee.role)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {getUserStatus(employee.status)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date de création</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(employee.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(employee.updatedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              {employee.lastLogin && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Dernière connexion</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(employee.lastLogin).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Informations de contact */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Informations de contact
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {employee.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Affectation à l'entreprise */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:col-span-2">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
              Affectation à l'entreprise
            </h3>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                {isAssigned ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Employé assigné à cette entreprise
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Employé non assigné à cette entreprise
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex space-x-2">
                {isAssigned && assignmentDate && (
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
                    <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Assigné le {new Date(assignmentDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}
                
                {onEdit && (
                  <Button 
                    variant="secondary" 
                    onClick={onEdit}
                  >
                    Modifier
                  </Button>
                )}
                
                {isAssigned ? (
                  onRemove && (
                    <Button 
                      variant="danger" 
                      onClick={onRemove}
                    >
                      Retirer de l'entreprise
                    </Button>
                  )
                ) : (
                  onAssign && (
                    <Button 
                      onClick={onAssign}
                    >
                      Assigner à l'entreprise
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};