"use client";

import React, { useState } from 'react';
import type { User, Business } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useUser';

interface EmployeesProps {
    users: User[];
    onAddUser: (newUser: User) => void;
    onUpdateUser: (updatedUser: User) => void;
    onDeleteUser: (userId: string) => void;
    allBusinesses: Business[];
}

// Form data interface to ensure all fields are strings for form inputs
interface UserFormData {
    name: string;
    email: string;
    password: string;
    role: string;
    avatarUrl: string;
    managedBusinessIds: string[];
}

export const Employees: React.FC<EmployeesProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, allBusinesses }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({ 
        name: '', 
        email: '', 
        password: '', 
        role: 'Gérant', 
        avatarUrl: '', 
        managedBusinessIds: [] 
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const { data: fetchedUsers = [], isLoading } = useUsers();
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Always reset password when editing
                role: user.role,
                avatarUrl: user.avatarUrl || '', // Handle null/undefined avatarUrl
                managedBusinessIds: user.managedBusinessIds ? [...user.managedBusinessIds] : [] // Copie du tableau
            });
        } else {
            setEditingUser(null);
            setFormData({ 
                name: '', 
                email: '', 
                password: '', 
                role: 'Gérant', 
                avatarUrl: '', 
                managedBusinessIds: [] 
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const role = e.target.value as 'Admin' | 'Gérant';
        setFormData(prev => ({
            ...prev,
            role,
            // Pour un admin, on ne gère aucune entreprise
            // Pour un gérant, on peut gérer une ou plusieurs entreprises
            managedBusinessIds: role === 'Admin' ? [] : prev.managedBusinessIds
        }));
    };

    const handleBusinessChange = (businessId: string, checked: boolean) => {
        setFormData(prev => {
            const managedBusinessIds = checked 
                ? [...(prev.managedBusinessIds || []), businessId]
                : (prev.managedBusinessIds || []).filter(id => id !== businessId);
            return { ...prev, managedBusinessIds };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Préparer les données utilisateur
        let userData: any = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        
        // Ajouter le mot de passe seulement s'il est fourni
        if (formData.password) {
          userData.password = formData.password;
        }
        
        // Ajouter l'avatar seulement s'il est fourni
        if (formData.avatarUrl) {
          userData.avatarUrl = formData.avatarUrl;
        }
        
        // Ajouter les entreprises gérées seulement pour les gérants
        if (formData.role === 'Gérant') {
          userData.managedBusinessIds = formData.managedBusinessIds;
        }
        
        if (editingUser) {
            // Update existing user
            await updateUserMutation.mutateAsync({ 
                id: editingUser.id, 
                data: userData
            });
        } else {
            // Create new user
            await createUserMutation.mutateAsync(userData);
        }
        
        handleCloseModal();
    };

    const handleDeleteUser = async () => {
        if (userToDelete) {
            try {
                await onDeleteUser(userToDelete.id);
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    const columns = [
        { 
            header: 'Nom', 
            accessor: 'name' as keyof User,
            render: (user: User) => (
                <div className="flex items-center">
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <span>{user.name}</span>
                </div>
            )
        },
        { header: 'Email', accessor: 'email' as keyof User },
        { 
            header: 'Rôle', 
            accessor: 'role' as keyof User,
            render: (user: User) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'Admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                }`}>
                    {user.role}
                </span>
            )
        },
        { 
            header: 'Entreprises', 
            accessor: 'managedBusinessIds' as keyof User,
            render: (user: User) => {
                if (user.role === 'Admin') {
                    return <span className="text-gray-500">Toutes</span>;
                }
                
                if (!user.managedBusinessIds || user.managedBusinessIds.length === 0) {
                    return <span className="text-gray-500">Aucune</span>;
                }
                
                const businessNames = user.managedBusinessIds
                    .map(id => {
                        const business = allBusinesses.find(b => b.id === id);
                        return business ? business.name : 'Inconnue';
                    })
                    .join(', ');
                
                return (
                    <div className="max-w-xs truncate" title={businessNames}>
                        {businessNames}
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof User,
            render: (user: User) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleOpenModal(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
                        title="Modifier"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => openDeleteModal(user)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                        title="Supprimer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des employés...</div>;
    }

    // Use fetched users if available, otherwise use the prop users
    const displayedUsers = fetchedUsers.length > 0 ? fetchedUsers : users;
    
    // Debug: Afficher les données des utilisateurs dans la console
    React.useEffect(() => {
        console.log('Users data:', displayedUsers);
    }, [displayedUsers]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Employés</h1>
                <Button onClick={() => handleOpenModal()}>Ajouter un Employé</Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={displayedUsers} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? "Modifier l'Employé" : "Ajouter un Employé"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            {editingUser ? 'Nouveau Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required={!editingUser}
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleRoleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="Gérant">Gérant</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    {formData.role === 'Gérant' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprises à gérer</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 rounded-md">
                                {allBusinesses.map((business: any) => (
                                    <div key={business.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`business-${business.id}`}
                                            checked={formData.managedBusinessIds?.includes(business.id) || false}
                                            onChange={(e) => handleBusinessChange(business.id, e.target.checked)}
                                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor={`business-${business.id}`} className="ml-2 block text-sm text-gray-700">
                                            {business.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">URL de l'avatar</label>
                        <input
                            type="text"
                            id="avatarUrl"
                            name="avatarUrl"
                            value={formData.avatarUrl}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="https://example.com/avatar.jpg"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending}>
                            {createUserMutation.isPending || updateUserMutation.isPending || deleteUserMutation.isPending ? 'Enregistrement...' : 
                             editingUser ? 'Mettre à Jour' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} title="Confirmer la suppression">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Êtes-vous sûr de vouloir supprimer l'employé <span className="font-bold">{userToDelete?.name}</span> ? 
                        Cette action est irréversible.
                    </p>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={closeDeleteModal}>Annuler</Button>
                        <Button 
                            variant="danger" 
                            onClick={handleDeleteUser}
                            disabled={deleteUserMutation.isPending}
                        >
                            {deleteUserMutation.isPending ? 'Suppression...' : 'Supprimer'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};