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
            header: 'Actions',
            accessor: 'id' as keyof Business,
            render: (item: Business) => (
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(item);
                        }}
                    >
                        Modifier
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                        }}
                    >
                        Supprimer
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
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Paramètres des Entreprises</h1>
                <Button onClick={() => handleOpenModal()}>Ajouter une Entreprise</Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={displayedBusinesses} 
                />
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
                        <input
                            type="text"
                            id="type"
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
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