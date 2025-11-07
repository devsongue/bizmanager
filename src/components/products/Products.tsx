"use client";

import React, { useState } from 'react';
import type { Business, Product } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/useProduct';
import { useRestockProduct } from '@/hooks/useRestock';
import { useSuppliers } from '@/hooks/useSupplier';

interface ProductsProps {
    business: Business;
    onAddProduct: (newProduct: Product) => void;
    onUpdateProduct: (updatedProduct: Product) => void;
}

export const Products: React.FC<ProductsProps> = ({ business, onAddProduct, onUpdateProduct }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({ 
        name: '', 
        category: '', 
        stock: 0, 
        retailPrice: 0, 
        wholesalePrice: 0,
        supplierId: '',
        supplierName: ''
    });
    const [restockData, setRestockData] = useState({ 
        quantity: 0, 
        cost: 0,
        unitCost: 0,
        totalCost: 0,
        supplierId: '',
        supplierName: ''
    });

    const { data: products = [], isLoading } = useProducts(business.id);
    const { data: suppliers = [], isLoading: isSuppliersLoading } = useSuppliers(business.id);
    const createProductMutation = useCreateProduct();
    const updateProductMutation = useUpdateProduct();
    const restockProductMutation = useRestockProduct();

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                category: product.category,
                stock: product.stock,
                retailPrice: product.retailPrice,
                wholesalePrice: product.wholesalePrice,
                supplierId: product.supplierId ?? '',
                supplierName: product.supplierName ?? ''
            });
        } else {
            setEditingProduct(null);
            setFormData({ 
                name: '', 
                category: '', 
                stock: 0, 
                retailPrice: 0, 
                wholesalePrice: 0,
                supplierId: '',
                supplierName: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleOpenRestockModal = (product: Product) => {
        setRestockingProduct(product);
        // Pre-fill with calculated unit cost based on current wholesale price
        const unitCost = product.wholesalePrice;
        setRestockData({ 
            quantity: 0, 
            cost: 0,
            unitCost: unitCost,
            totalCost: 0,
            supplierId: product.supplierId ?? '',
            supplierName: product.supplierName ?? ''
        });
        setIsRestockModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleCloseRestockModal = () => {
        setIsRestockModalOpen(false);
        setRestockingProduct(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' || name === 'retailPrice' || name === 'wholesalePrice' ? Number(value) : value
        }));
    };

    const handleRestockChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'supplierId') {
            // Find the supplier name based on the selected ID
            const selectedSupplier = suppliers.find((supplier: any) => supplier.id === value);
            setRestockData(prev => ({
                ...prev,
                supplierId: value,
                supplierName: selectedSupplier ? selectedSupplier.name : ''
            }));
            return;
        }
        
        const numValue = Number(value);
        
        setRestockData(prev => {
            const updatedData = {
                ...prev,
                [name]: name === 'quantity' || name === 'unitCost' || name === 'totalCost' ? numValue : value
            };
            
            // Auto-calculate total cost based on quantity and unit cost
            if (name === 'quantity' || name === 'unitCost') {
                const quantity = name === 'quantity' ? numValue : prev.quantity;
                const unitCost = name === 'unitCost' ? numValue : prev.unitCost;
                updatedData.totalCost = quantity * unitCost;
            }
            
            // Auto-calculate unit cost based on total cost and quantity
            if (name === 'totalCost') {
                updatedData.unitCost = prev.quantity > 0 ? numValue / prev.quantity : 0;
            }
            
            return updatedData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingProduct) {
            // Update existing product
            await updateProductMutation.mutateAsync({ 
                id: editingProduct.id, 
                data: formData 
            });
        } else {
            // Create new product
            await createProductMutation.mutateAsync({ 
                businessId: business.id, 
                data: formData 
            });
        }
        
        handleCloseModal();
    };

    const handleRestockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (restockingProduct) {
            await restockProductMutation.mutateAsync({ 
                id: restockingProduct.id, 
                quantity: restockData.quantity,
                cost: restockData.totalCost, // Pass total cost instead of unit cost
                supplierId: restockData.supplierId || undefined // Pass supplierId if available
            });
        }
        
        handleCloseRestockModal();
    };

    const columns = [
        { header: 'Nom', accessor: 'name' },
        { header: 'Catégorie', accessor: 'category' },
        { 
            header: 'Fournisseur', 
            accessor: 'supplierName',
            render: (item: Product) => item.supplierName || 'Non spécifié'
        },
        { 
            header: 'Stock', 
            accessor: 'stock',
            render: (item: Product) => (
                <div className="flex items-center">
                    <span className={item.stock < 10 ? "text-red-600 font-bold" : ""}>
                        {item.stock}
                    </span>
                    {item.stock < 10 && (
                        <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            Faible
                        </span>
                    )}
                </div>
            )
        },
        { 
            header: 'Prix Détail', 
            accessor: 'retailPrice',
            render: (item: Product) => `${item.retailPrice.toLocaleString('fr-FR')} FCFA`
        },
        { 
            header: 'Prix Gros', 
            accessor: 'wholesalePrice',
            render: (item: Product) => `${item.wholesalePrice.toLocaleString('fr-FR')} FCFA`
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (item: Product) => (
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary"
                        onClick={() => handleOpenModal(item)}
                    >
                        Modifier
                    </Button>
                    <Button 
                        onClick={() => handleOpenRestockModal(item)}
                    >
                        Réapprovisionner
                    </Button>
                </div>
            )
        }
    ] as any;

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">Chargement des produits...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Produits</h1>
                <Button onClick={() => handleOpenModal()}>Ajouter un Produit</Button>
            </div>

            {/* Low stock alert */}
            {products.some((p: any) => p.stock < 10) && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <span className="font-medium">Attention!</span> Certains produits ont un stock faible.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <Table 
                    columns={columns} 
                    data={products} 
                />
            </div>

            {/* Add/Edit Product Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? "Modifier le Produit" : "Ajouter un Produit"}>
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
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <input
                            type="text"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                        <select
                            id="supplierId"
                            name="supplierId"
                            value={formData.supplierId ?? ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Sélectionner un fournisseur (optionnel)</option>
                            {suppliers.map((supplier: any) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input
                            type="number"
                            id="stock"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700 mb-1">Prix Détail (FCFA)</label>
                        <input
                            type="number"
                            id="retailPrice"
                            name="retailPrice"
                            value={formData.retailPrice}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700 mb-1">Prix Gros (FCFA)</label>
                        <input
                            type="number"
                            id="wholesalePrice"
                            name="wholesalePrice"
                            value={formData.wholesalePrice}
                            onChange={handleChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                        <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                            {createProductMutation.isPending || updateProductMutation.isPending ? 'Enregistrement...' : 
                             editingProduct ? 'Mettre à Jour' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Restock Modal */}
            <Modal isOpen={isRestockModalOpen} onClose={handleCloseRestockModal} title={`Réapprovisionner ${restockingProduct?.name}`}>
                <form onSubmit={handleRestockSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <h3 className="text-lg font-medium text-blue-800 mb-2">Informations actuelles</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-blue-600">Stock actuel</p>
                                <p className="font-medium">{restockingProduct?.stock} unités</p>
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">Coût unitaire actuel</p>
                                <p className="font-medium">{restockingProduct?.wholesalePrice.toLocaleString('fr-FR')} FCFA</p>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                        <select
                            id="supplierId"
                            name="supplierId"
                            value={restockData.supplierId ?? ''}
                            onChange={handleRestockChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">Sélectionner un fournisseur (optionnel)</option>
                            {suppliers.map((supplier: any) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </select>
                        {restockData.supplierName && (
                            <p className="mt-1 text-sm text-gray-500">Fournisseur sélectionné: {restockData.supplierName}</p>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantité à ajouter</label>
                        <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={restockData.quantity}
                            onChange={handleRestockChange}
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="unitCost" className="block text-sm font-medium text-gray-700 mb-1">Coût unitaire (FCFA)</label>
                        <input
                            type="number"
                            id="unitCost"
                            name="unitCost"
                            value={restockData.unitCost}
                            onChange={handleRestockChange}
                            min="0"
                            step="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">Coût d'achat par unité</p>
                    </div>
                    
                    <div>
                        <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700 mb-1">Coût total (FCFA)</label>
                        <input
                            type="number"
                            id="totalCost"
                            name="totalCost"
                            value={restockData.totalCost}
                            onChange={handleRestockChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        />
                        <p className="mt-1 text-sm text-gray-500">Coût total du réapprovisionnement</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-green-800 mb-2">Résumé du réapprovisionnement</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-green-600">Nouveau stock total</p>
                                <p className="font-medium">{(restockingProduct?.stock || 0) + restockData.quantity} unités</p>
                            </div>
                            <div>
                                <p className="text-sm text-green-600">Nouveau coût unitaire moyen</p>
                                <p className="font-medium">
                                    {restockingProduct && restockData.quantity > 0 
                                        ? Math.round(((restockingProduct.wholesalePrice * restockingProduct.stock) + restockData.totalCost) / (restockingProduct.stock + restockData.quantity)).toLocaleString('fr-FR')
                                        : restockingProduct?.wholesalePrice.toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={handleCloseRestockModal}>Annuler</Button>
                        <Button type="submit" disabled={restockProductMutation.isPending || restockData.quantity <= 0 || restockData.totalCost <= 0}>
                            {restockProductMutation.isPending ? 'Réapprovisionnement...' : 'Réapprovisionner'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};