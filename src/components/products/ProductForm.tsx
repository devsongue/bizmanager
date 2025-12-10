"use client";

import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Supplier } from '@/types';
import { Button } from '../shared/Button';

interface ProductFormProps {
    product?: Product;
    suppliers: Supplier[];
    onSubmit: (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'sku' | 'barcode' | 'images'> & { images?: string[] }) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ 
    product, 
    suppliers, 
    onSubmit, 
    onCancel,
    isSubmitting = false
}) => {
    const [formData, setFormData] = useState<Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'sku' | 'barcode' | 'images'>>({ 
        name: product?.name || '', 
        description: product?.description || '',
        category: product?.category || '', 
        stock: product?.stock || 0,
        minStock: product?.minStock || 10,
        costPrice: product?.costPrice || 0,
        retailPrice: product?.retailPrice || 0, 
        wholesalePrice: product?.wholesalePrice || 0,
        purchasePrice: product?.purchasePrice || 0,
        supplierId: product?.supplierId ?? undefined,
    });
    
    const [imagePreviews, setImagePreviews] = useState<string[]>(product?.images || []);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    
    // États pour la visualisation en temps réel
    const [profitMargin, setProfitMargin] = useState<number>(0);
    const [wholesaleProfitMargin, setWholesaleProfitMargin] = useState<number>(0);
    const [stockValue, setStockValue] = useState<number>(0);
    
    // Gestion des images
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedImages(files);
            
            // Créer des aperçus pour l'affichage
            const previews = files.map(file => URL.createObjectURL(file));
            setImagePreviews(prev => [...prev, ...previews]);
        }
    };
    
    // Suggestions de prix basées sur les marges cibles
    const priceSuggestions = useMemo(() => {
        const suggestions = {
            retail: 0,
            wholesale: 0
        };
        
        if (formData.costPrice > 0) {
            // Marge cible de 30% pour le détail
            suggestions.retail = Math.round(formData.costPrice * 1.3);
            // Marge cible de 20% pour le gros
            suggestions.wholesale = Math.round(formData.costPrice * 1.2);
        }
        
        return suggestions;
    }, [formData.costPrice]);
    
    // Calcul des marges et valeur du stock en temps réel
    useEffect(() => {
        // Calcul de la marge bénéficiaire détail
        if (formData.costPrice > 0 && formData.retailPrice > 0) {
            const margin = ((formData.retailPrice - formData.costPrice) / formData.costPrice) * 100;
            setProfitMargin(parseFloat(margin.toFixed(2)));
        } else {
            setProfitMargin(0);
        }
        
        // Calcul de la marge bénéficiaire gros
        if (formData.costPrice > 0 && formData.wholesalePrice > 0) {
            const margin = ((formData.wholesalePrice - formData.costPrice) / formData.costPrice) * 100;
            setWholesaleProfitMargin(parseFloat(margin.toFixed(2)));
        } else {
            setWholesaleProfitMargin(0);
        }
        
        // Calcul de la valeur du stock
        setStockValue(formData.stock * formData.wholesalePrice);
    }, [formData.costPrice, formData.retailPrice, formData.wholesalePrice, formData.stock]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' || name === 'minStock' || name === 'costPrice' || name === 'retailPrice' || name === 'wholesalePrice' || name === 'purchasePrice' ? Number(value) : value
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, images: imagePreviews });
    };
    
    // Fonction pour obtenir la couleur de la marge en fonction de sa valeur
    const getMarginColor = (margin: number) => {
        if (margin >= 50) return 'text-green-600';
        if (margin >= 20) return 'text-yellow-600';
        return 'text-red-600';
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nom du produit *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                        placeholder="Ex: Smartphone Samsung Galaxy"
                    />
                </div>
                
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Catégorie *
                    </label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                        placeholder="Ex: Électronique"
                    />
                </div>
            </div>
            
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                </label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Description du produit..."
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label htmlFor="stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Stock actuel *
                    </label>
                    <input
                        type="number"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        required
                        min="0"
                    />
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Valeur: {stockValue.toLocaleString('fr-FR')} FCFA
                    </div>
                </div>
                
                <div>
                    <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Stock minimum
                    </label>
                    <input
                        type="number"
                        id="minStock"
                        name="minStock"
                        value={formData.minStock}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="0"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Alerte envoyée lorsque le stock descend en dessous de cette valeur
                    </p>
                </div>
                
                <div>
                    <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fournisseur
                    </label>
                    <select
                        id="supplierId"
                        name="supplierId"
                        value={formData.supplierId || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">Sélectionner un fournisseur</option>
                        {suppliers.map((supplier: Supplier) => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Prix du produit</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Prix d'achat (FCFA) *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="costPrice"
                                name="costPrice"
                                value={formData.costPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                min="0"
                                placeholder="0"
                                required
                            />
                            {/* Indicateur visuel pour le champ obligatoire */}
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <span className="text-red-500">*</span>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="retailPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Prix détail (FCFA) *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="retailPrice"
                                name="retailPrice"
                                value={formData.retailPrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                min="0"
                                placeholder="0"
                            />
                            {priceSuggestions.retail > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, retailPrice: priceSuggestions.retail }))}
                                    className="absolute right-2 top-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                                    title="Appliquer la suggestion de prix"
                                >
                                    Suggéré: {priceSuggestions.retail.toLocaleString('fr-FR')}
                                </button>
                            )}
                        </div>
                        <div className={`mt-1 text-sm ${getMarginColor(profitMargin)}`}>
                            Marge: {profitMargin.toFixed(2)}%
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="wholesalePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Prix gros (FCFA) *
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="wholesalePrice"
                                name="wholesalePrice"
                                value={formData.wholesalePrice}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required
                                min="0"
                                placeholder="0"
                            />
                            {priceSuggestions.wholesale > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, wholesalePrice: priceSuggestions.wholesale }))}
                                    className="absolute right-2 top-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                                    title="Appliquer la suggestion de prix"
                                >
                                    Suggéré: {priceSuggestions.wholesale.toLocaleString('fr-FR')}
                                </button>
                            )}
                        </div>
                        <div className={`mt-1 text-sm ${getMarginColor(wholesaleProfitMargin)}`}>
                            Marge: {wholesaleProfitMargin.toFixed(2)}%
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images du produit
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                            <label className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                <span>Sélectionner des fichiers</span>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleImageChange}
                                    className="sr-only" 
                                />
                            </label>
                            <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF jusqu'à 10MB
                        </p>
                    </div>
                </div>
                
                {/* Indicateur visuel du nombre d'images */}
                {imagePreviews.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {imagePreviews.length} image{imagePreviews.length > 1 ? 's' : ''} sélectionnée{imagePreviews.length > 1 ? 's' : ''}
                    </div>
                )}
                
                {/* Aperçu des images */}
                {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                                <img 
                                    src={preview} 
                                    alt={`Preview ${index}`} 
                                    className="h-24 w-full object-cover rounded-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newPreviews = imagePreviews.filter((_, i) => i !== index);
                                        setImagePreviews(newPreviews);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
                <Button 
                    variant="secondary" 
                    onClick={onCancel} 
                    className="px-5 py-2"
                    type="button"
                >
                    Annuler
                </Button>
                <Button 
                    type="submit" 
                    className="px-5 py-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Enregistrement...
                        </div>
                    ) : product ? "Mettre à jour" : "Ajouter"}
                </Button>
            </div>
        </form>
    );
};