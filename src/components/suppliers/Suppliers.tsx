"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
    const [formData, setFormData] = useState<Omit<Supplier, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'email' | 'telephone' | 'address' | 'rating' | 'notes'>>({ 
        name: '', 
        product: '',
        contacts: '',
        description: '',
        productTypes: ''
    });

    // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
    const businessId = useMemo(() => business.id, [business.id]);
    
    const { data: suppliers = [], isLoading } = useSuppliers(businessId);
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
            setFormData({ 
                name: '', 
                product: '',
                contacts: '',
                description: '',
                productTypes: ''
            });
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
        
        // Ajouter les champs requis manquants
        const supplierData: any = {
            ...formData,
            businessId: business.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Champs optionnels avec valeurs par défaut
            email: undefined,
            telephone: undefined,
            address: undefined,
            rating: undefined,
            notes: undefined
        };
        
        try {
            if (isEditing && currentSupplier) {
                // Update existing supplier
                await updateSupplierMutation.mutateAsync({ 
                    id: currentSupplier.id, 
                    data: supplierData 
                });
            } else {
                // Create new supplier
                await createSupplierMutation.mutateAsync({ 
                    businessId: business.id, 
                    data: supplierData 
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

    const columns = useMemo(() => [
        { header: 'Nom', accessor: 'name' as keyof Supplier },
        { header: 'Produit', accessor: 'product' as keyof Supplier },
        { 
            header: 'Contacts', 
            accessor: 'contacts' as keyof Supplier,
            render: (item: Supplier) => item.contacts || '-'
        },
        { 
            header: 'Types de produits', 
            accessor: 'productTypes' as keyof Supplier,
            render: (item: Supplier) => item.productTypes || '-'
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Supplier,
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
    ], []);

    if (isLoading) {
        return (
              <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4">
   <div className="flex items-center space-x-4 p-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div>
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
        <div className="space-y-2">
          <p className="font-semibold text-gray-800">Fournisseurs</p>
          <p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p>
        </div>
      </div>
    </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Fournisseurs - {business.name}</h1>
                <Button onClick={() => handleOpenModal()}>Ajouter un Fournisseur</Button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={suppliers as any} 
                />
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditing ? "Modifier un Fournisseur" : "Ajouter un Fournisseur"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                errors.name ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                            }`}
                            required
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="product" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Produit</label>
                        <input
                            type="text"
                            id="product"
                            name="product"
                            value={formData.product}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                errors.product ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
                            }`}
                            required
                        />
                        {errors.product && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.product}</p>}
                    </div>
                    <div>
                        <label htmlFor="contacts" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contacts</label>
                        <input
                            type="text"
                            id="contacts"
                            name="contacts"
                            value={formData.contacts || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="productTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Types de produits</label>
                        <input
                            type="text"
                            id="productTypes"
                            name="productTypes"
                            value={formData.productTypes || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createSupplierMutation.isPending || updateSupplierMutation.isPending}>
                            {createSupplierMutation.isPending || updateSupplierMutation.isPending ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};