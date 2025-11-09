"use client";

import React, { useState } from 'react';
import type { Business } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useBusinesses, useCreateBusiness, useUpdateBusiness, useDeleteBusiness } from '@/hooks/useBusiness';

interface SettingsProps {
    businesses: Business[];
    onAddBusiness: (newBusiness: Business) => void;
    onUpdateBusiness: (updatedBusiness: Business) => void;
    onDeleteBusiness: (businessId: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ businesses, onAddBusiness, onUpdateBusiness, onDeleteBusiness }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
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
            setEditingBusiness(business);
            setFormData({
                name: business.name,
                type: business.type
            });
        } else {
            setEditingBusiness(null);
            setFormData({ name: '', type: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBusiness(null);
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
        
        if (editingBusiness) {
            // Update existing business
            await updateBusinessMutation.mutateAsync({ 
                id: editingBusiness.id, 
                data: formData 
            });
        } else {
            // Create new business
            await createBusinessMutation.mutateAsync(formData);
        }
        
        handleCloseModal();
    };

    const handleDelete = async (businessId: string) => {
        if (fetchedBusinesses.length <= 1) {
            alert("Vous ne pouvez pas supprimer la dernière entreprise.");
            return;
        }
        
        if (confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) {
            await deleteBusinessMutation.mutateAsync(businessId);
        }
    };

    const columns = [
        { header: 'Nom', accessor: 'name' as keyof Business },
        { header: 'Type', accessor: 'type' as keyof Business },
        {
            header: 'Statistiques',
            accessor: 'id' as keyof Business,
            render: (item: Business) => (
                <div className="flex space-x-4 text-sm">
                    <div>
                        <span className="font-medium">Ventes:</span> {item.sales?.length || 0}
                    </div>
                    <div>
                        <span className="font-medium">Dépenses:</span> {item.expenses?.length || 0}
                    </div>
                    <div>
                        <span className="font-medium">Produits:</span> {item.products?.length || 0}
                    </div>
                </div>
            )
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
                    >
                        <span className="text-xs">Modifier</span>
                    </Button>
                    <Button 
                        variant="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Rediriger vers le tableau de bord de l'entreprise
                            window.location.href = `/business/${item.id}`;
                        }}
                    >
                        <span className="text-xs">Voir</span>
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                        }}
                        disabled={displayedBusinesses.length <= 1}
                    >
                        <span className="text-xs">Supprimer</span>
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
                    <h1 className="text-3xl font-bold text-gray-800">Paramètres des Entreprises</h1>
                    <p className="text-gray-600 mt-2">
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

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <Table 
                        columns={columns} 
                        data={displayedBusinesses} 
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Statistiques Globales</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Total des Entreprises</h3>
                        <p className="text-3xl font-bold text-primary-600">{displayedBusinesses.length}</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Total des Ventes</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {displayedBusinesses.reduce((sum, business) => sum + (business.sales?.length || 0), 0)}
                        </p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900">Total des Produits</h3>
                        <p className="text-3xl font-bold text-blue-600">
                            {displayedBusinesses.reduce((sum, business) => sum + (business.products?.length || 0), 0)}
                        </p>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBusiness ? "Modifier l'Entreprise" : "Ajouter une Entreprise"}>
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
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                        <Button type="submit" disabled={createBusinessMutation.isPending || updateBusinessMutation.isPending}>
                            {createBusinessMutation.isPending || updateBusinessMutation.isPending ? 'Enregistrement...' : 
                             editingBusiness ? 'Mettre à Jour' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};