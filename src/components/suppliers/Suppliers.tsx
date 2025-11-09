"use client";

import React, { useState } from 'react';
import type { Business, Supplier } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useSuppliers, useCreateSupplier } from '@/hooks/useSupplier';

interface SuppliersProps {
    business: Business;
    onAddSupplier: (newSupplier: Supplier) => void;
}

export const Suppliers: React.FC<SuppliersProps> = ({ business, onAddSupplier }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({ 
        name: '', 
        product: '',
        contacts: '',
        description: '',
        productTypes: ''
    });

    const { data: suppliers = [], isLoading } = useSuppliers(business.id);
    const createSupplierMutation = useCreateSupplier();

    const handleOpenModal = () => {
        setFormData({ name: '', product: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Create new supplier
        await createSupplierMutation.mutateAsync({ 
            businessId: business.id, 
            data: formData 
        });
        
        handleCloseModal();
    };

    const columns: any[] = [
        { header: 'Nom', accessor: 'name' },
        { header: 'Produit', accessor: 'product' }
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des fournisseurs...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Fournisseurs</h1>
                <Button onClick={handleOpenModal}>Ajouter un Fournisseur</Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={suppliers} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Ajouter un Fournisseur">
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
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                        <input
                            type="text"
                            id="product"
                            name="product"
                            value={formData.product}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="contacts" className="block text-sm font-medium text-gray-700 mb-1">Contacts</label>
                        <input
                            type="text"
                            id="contacts"
                            name="contacts"
                            value={formData.contacts || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="productTypes" className="block text-sm font-medium text-gray-700 mb-1">Types de produits</label>
                        <input
                            type="text"
                            id="productTypes"
                            name="productTypes"
                            value={formData.productTypes || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createSupplierMutation.isPending}>
                            {createSupplierMutation.isPending ? 'Enregistrement...' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};