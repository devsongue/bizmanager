"use client";

import React, { useState } from 'react';
import type { Business, BusinessType, User } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@/hooks/useBusiness';
import { useUsers } from '@/hooks/useUser'; // Ajout de l'import pour useUsers
import { Edit, Eye, Trash2 } from 'lucide-react';

interface SettingsProps {
    businesses: Business[];
    onAddBusiness: (newBusiness: Business) => void;
    onUpdateBusiness: (updatedBusiness: Business) => void;
    onDeleteBusiness: (businessId: string) => void;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `${amount?.toLocaleString('fr-FR')} FCFA`;
};

export const Settings: React.FC<SettingsProps> = ({ businesses, onAddBusiness, onUpdateBusiness, onDeleteBusiness }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
    const [formData, setFormData] = useState<Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers' | 'createdAt' | 'updatedAt' | 'deletedAt'>>({
        name: '',
        type: 'SHOP' as BusinessType
    });
    
    // État pour gérer les employés assignés à l'entreprise
    const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);

    // État pour la recherche d'entreprises
    const [searchTerm, setSearchTerm] = useState('');

    const { data: fetchedBusinesses = [], isLoading: isBusinessesLoading } = useBusinesses();
    const { data: fetchedUsers = [], isLoading: isUsersLoading } = useUsers(); // Récupération des utilisateurs
    const createBusinessMutation = useCreateBusiness();
    const updateBusinessMutation = useUpdateBusiness();
    const deleteBusinessMutation = useDeleteBusiness();

    // Utiliser les données récupérées ou les props
    const displayedBusinesses = fetchedBusinesses.length > 0 ? fetchedBusinesses : businesses;
    const allUsers = fetchedUsers.length > 0 ? fetchedUsers : [];

    const handleOpenModal = (business?: Business) => {
        if (business) {
            setIsEditing(true);
            setCurrentBusiness(business);
            setFormData({
                name: business.name,
                type: business.type
            });
            
            // Initialiser les employés assignés
            const employeeIds = allUsers
                .filter(user => user.managedBusinessIds?.includes(business.id))
                .map(user => user.id);
            setAssignedEmployeeIds(employeeIds);
        } else {
            setIsEditing(false);
            setCurrentBusiness(null);
            setFormData({ name: '', type: 'SHOP' as BusinessType });
            setAssignedEmployeeIds([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentBusiness(null);
        setAssignedEmployeeIds([]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Gérer le changement d'assignation d'un employé
    const handleEmployeeAssignmentChange = (employeeId: string, checked: boolean) => {
        if (checked) {
            setAssignedEmployeeIds(prev => [...prev, employeeId]);
        } else {
            setAssignedEmployeeIds(prev => prev.filter(id => id !== employeeId));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditing && currentBusiness) {
                // Update existing business
                await updateBusinessMutation.mutateAsync({
                    id: currentBusiness.id,
                    data: formData
                });
                
                // Mettre à jour les assignations des employés
                await updateEmployeeAssignments(currentBusiness.id, assignedEmployeeIds);
            } else {
                // Create new business
                await createBusinessMutation.mutateAsync(formData);
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error saving business:', error);
        }
    };

    // Fonction pour mettre à jour les assignations des employés
    const updateEmployeeAssignments = async (businessId: string, assignedIds: string[]) => {
        try {
            // Pour chaque utilisateur, mettre à jour ses managedBusinessIds
            for (const user of allUsers) {
                const currentlyAssigned = user.managedBusinessIds?.includes(businessId) || false;
                const shouldBeAssigned = assignedIds.includes(user.id);
                
                // Si l'état d'assignation a changé, mettre à jour l'utilisateur
                if (currentlyAssigned !== shouldBeAssigned) {
                    let newManagedBusinessIds = user.managedBusinessIds || [];
                    
                    if (shouldBeAssigned) {
                        // Ajouter l'entreprise aux managedBusinessIds
                        newManagedBusinessIds = [...newManagedBusinessIds, businessId];
                    } else {
                        // Retirer l'entreprise des managedBusinessIds
                        newManagedBusinessIds = newManagedBusinessIds.filter(id => id !== businessId);
                    }
                    
                    // Appeler l'action de mise à jour de l'utilisateur
                    // Note: Dans une implémentation complète, vous auriez besoin d'une action côté serveur
                    // pour mettre à jour les managedBusinessIds de l'utilisateur
                    console.log(`Updating user ${user.id} with managedBusinessIds:`, newManagedBusinessIds);
                }
            }
        } catch (error) {
            console.error('Error updating employee assignments:', error);
        }
    };

    const handleDelete = async (businessId: string) => {
        if (fetchedBusinesses.length <= 1) {
            alert("Vous ne pouvez pas supprimer la dernière entreprise.");
            return;
        }

        if (confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
            try {
                await deleteBusinessMutation.mutateAsync(businessId);
            } catch (error) {
                console.error('Error deleting business:', error);
            }
        }
    };

    // Helper function to calculate cost of goods sold (COGS)
    const calculateCOGS = (sales: any[], products: any[]): number => {
        return sales.reduce((sum, sale) => {
            // Find the product to get its wholesale price
            const product = products.find((p: any) => p.id === sale.productId);
            const wholesalePrice = product ? product.wholesalePrice : 0;
            return sum + (wholesalePrice * sale.quantity);
        }, 0);
    };

    // Helper function to calculate operational expenses
    const calculateOperationalExpenses = (expenses: any[]): number => {
        return expenses.reduce((sum, expense) => sum + expense.amount, 0);
    };

    const columns = [
        { header: 'Nom', accessor: 'name' as keyof Business },
        { header: 'Type', accessor: 'type' as keyof Business },
        {
            header: 'Statistiques',
            accessor: 'id' as keyof Business,
            render: (item: Business) => {
                const totalSales = item.sales?.reduce((sum, sale) => sum + sale.total, 0) || 0;
                const totalCOGS = calculateCOGS(item.sales || [], item.products || []);
                const totalOperationalExpenses = calculateOperationalExpenses(item.expenses || []);
                const netProfit = totalSales - totalCOGS - totalOperationalExpenses;

                return (
                    <div className="flex flex-wrap gap-2 text-sm">
                        <div className="bg-orange-100 dark:bg-orange-900 px-2 py-1 rounded">
                            <span className="font-medium">Ventes:</span> {item.sales?.length || 0}
                        </div>
                        <div className="bg-red-100 dark:bg-red-900 px-2 py-1 rounded">
                            <span className="font-medium">Dépenses:</span> {item.expenses?.length || 0}
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                            <span className="font-medium">Produits:</span> {item.products?.length || 0}
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                            <span className="font-medium">Bénéfice:</span> {formatCurrency(netProfit)}
                        </div>
                    </div>
                );
            }
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Business,
            render: (item: Business) => (
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(item);
                        }}
                        className="p-2"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Rediriger vers le tableau de bord de l'entreprise
                            window.location.href = `/business/${item.id}`;
                        }}
                        className="p-2"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="danger"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                        }}
                        disabled={displayedBusinesses.length <= 1}
                        className="p-2"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (isBusinessesLoading || isUsersLoading) {
        return (
            <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
                <div className="flex items-center space-x-4 p-6">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
                        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-800">Settings</p>
                        <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Filtrer les entreprises en fonction du terme de recherche
    const filteredBusinesses = displayedBusinesses.filter(business =>
        business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Paramètres des Entreprises</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gérez vos entreprises et accédez à leurs tableaux de bord
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Rechercher une entreprise..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Ajouter une Entreprise
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table
                        columns={columns}
                        data={displayedBusinesses}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Statistiques Globales</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total des Entreprises</h3>
                        <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{displayedBusinesses.length}</p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total des Ventes</h3>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {displayedBusinesses.reduce((sum, business) => sum + (business.sales?.length || 0), 0)}
                        </p>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total des Produits</h3>
                        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                            {displayedBusinesses.reduce((sum, business) => sum + (business.products?.length || 0), 0)}
                        </p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditing ? "Modifier l'Entreprise" : "Ajouter une Entreprise"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            <option value="SHOP">Boutique</option>
                            <option value="RESTAURANT">Restaurant</option>
                            <option value="SERVICE">Services</option>
                            <option value="OTHER">Autre</option>
                        </select>
                    </div>
                    
                    {/* Section pour assigner des employés à l'entreprise */}
                    {isEditing && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigner des Employés</label>
                            <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md">
                                {allUsers
                                    .filter(user => user.role === 'MANAGER') // Ne montrer que les managers
                                    .map(user => (
                                        <div key={user.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`employee-${user.id}`}
                                                checked={assignedEmployeeIds.includes(user.id)}
                                                onChange={(e) => handleEmployeeAssignmentChange(user.id, e.target.checked)}
                                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`employee-${user.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                                {user.name} ({user.email})
                                            </label>
                                        </div>
                                    ))
                                }
                                {allUsers.filter(user => user.role === 'MANAGER').length === 0 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Aucun employé disponible à assigner</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button
                            type="submit"
                            disabled={createBusinessMutation.isPending || updateBusinessMutation.isPending}
                        >
                            {createBusinessMutation.isPending || updateBusinessMutation.isPending ? 'Enregistrement...' :
                                isEditing ? 'Mettre à Jour' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};