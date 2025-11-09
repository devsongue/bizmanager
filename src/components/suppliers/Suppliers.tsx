"use client";

import React, { useState, useEffect } from 'react';
import type { Business, Supplier } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useSupplier';
import { Edit, Trash2 } from 'lucide-react';

interface SuppliersProps {
    business: Business;
    onAddSupplier: (newSupplier: Supplier) => void;
}

export const Suppliers: React.FC<SuppliersProps> = ({ business, onAddSupplier }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({ 
        name: '', 
        product: '',
        contacts: '',
        description: '',
        productTypes: ''
    });

    const { data: suppliers = [], isLoading } = useSuppliers(business.id);
    const createSupplierMutation = useCreateSupplier();
    const updateSupplierMutation = useUpdateSupplier();
    const deleteSupplierMutation = useDeleteSupplier();

    // S'assurer que le formulaire est mis à jour lorsque le fournisseur à éditer change
    useEffect(() => {
        if (isEditing && currentSupplier) {
            setFormData({
                name: currentSupplier.name,
                product: currentSupplier.product,
                contacts: currentSupplier.contacts || '',
                description: currentSupplier.description || '',
                productTypes: currentSupplier.productTypes || ''
            });
        }
    }, [isEditing, currentSupplier]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Le nom du fournisseur est requis';
        }
        
        if (!formData.product.trim()) {
            newErrors.product = 'Le produit est requis';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenModal = (supplier?: Supplier) => {
        if (supplier) {
            setIsEditing(true);
            setCurrentSupplier(supplier);
            // Les données du formulaire seront mises à jour par l'effet useEffect
        } else {
            setIsEditing(false);
            setCurrentSupplier(null);
            setFormData({ name: '', product: '', contacts: '', description: '', productTypes: '' });
        }
        setErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentSupplier(null);
        setErrors({});
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        try {
            if (isEditing && currentSupplier) {
                // Update existing supplier
                await updateSupplierMutation.mutateAsync({ 
                    id: currentSupplier.id, 
                    data: formData 
                });
            } else {
                // Create new supplier
                await createSupplierMutation.mutateAsync({ 
                    businessId: business.id, 
                    data: formData 
                });
            }
            
            handleCloseModal();
        } catch (error) {
            console.error('Error saving supplier:', error);
            // Handle error display if needed
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            try {
                await deleteSupplierMutation.mutateAsync(id);
            } catch (error) {
                console.error('Error deleting supplier:', error);
                // Handle error display if needed
            }
        }
    };

    const columns: any[] = [
        { header: 'Nom', accessor: 'name' },
        { header: 'Produit', accessor: 'product' },
        { 
            header: 'Contacts', 
            accessor: 'contacts',
            render: (item: Supplier) => item.contacts || '-'
        },
        { 
            header: 'Types de produits', 
            accessor: 'productTypes',
            render: (item: Supplier) => item.productTypes || '-'
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (item: Supplier) => (
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => handleOpenModal(item)}
                        className="p-2"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                        variant="danger" 
                        onClick={() => handleDelete(item.id)}
                        className="p-2"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des fournisseurs...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Fournisseurs</h1>
                <Button onClick={() => handleOpenModal()}>Ajouter un Fournisseur</Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={suppliers} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditing ? "Modifier un Fournisseur" : "Ajouter un Fournisseur"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                        <input
                            type="text"
                            id="product"
                            name="product"
                            value={formData.product}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                errors.product ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.product && <p className="mt-1 text-sm text-red-600">{errors.product}</p>}
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
                        <Button 
                            type="submit" 
                            disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {createSupplierMutation.isPending || updateSupplierMutation.isPending ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Enregistrement...
                                </span>
                            ) : isEditing ? 'Modifier' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};