"use client";

import React, { useState } from 'react';
import type { Business } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@/hooks/useBusiness';
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
    const [formData, setFormData] = useState<Omit<Business, 'id' | 'sales' | 'expenses' | 'products' | 'clients' | 'suppliers'>>({ 
        name: '', 
        type: '' 
    });

    const { data: fetchedBusinesses = [], isLoading } = useBusinesses();
    const createBusinessMutation = useCreateBusiness();
    const updateBusinessMutation = useUpdateBusiness();
    const deleteBusinessMutation = useDeleteBusiness();

    const handleOpenModal = (business?: Business) => {
        if (business) {
            setIsEditing(true);
            setCurrentBusiness(business);
            setFormData({
                name: business.name,
                type: business.type
            });
        } else {
            setIsEditing(false);
            setCurrentBusiness(null);
            setFormData({ name: '', type: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentBusiness(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
            } else {
                // Create new business
                await createBusinessMutation.mutateAsync(formData);
            }
            
            handleCloseModal();
        } catch (error) {
            console.error('Error saving business:', error);
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
                        <div className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
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

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des entreprises...</div>;
    }

    // Use fetched businesses if available, otherwise use the prop businesses
    const displayedBusinesses = fetchedBusinesses.length > 0 ? fetchedBusinesses : businesses;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Paramètres des Entreprises</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gérez vos entreprises et accédez à leurs tableaux de bord
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Ajouter une Entreprise
                </Button>
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
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
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
                            <option value="">Sélectionnez un type</option>
                            <option value="Boutique">Boutique</option>
                            <option value="Restaurant">Restaurant</option>
                            <option value="Services">Services</option>
                            <option value="Commerce électronique">Commerce électronique</option>
                            <option value="Autre">Autre</option>
                        </select>
                    </div>
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