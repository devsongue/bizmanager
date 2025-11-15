"use client";

import React, { useState, useMemo } from 'react';
import type { Business, Sale, Product, Client } from '@/types';
import { Button } from '../shared/Button';
import { Modal } from '../shared/Modal';
import { Table } from '../shared/Table';
import { useSales, useCreateSale } from '@/hooks/useSale';
import { useProducts } from '@/hooks/useProduct';
import { useClients } from '@/hooks/useClient';
import { Plus, Trash2, Printer, ChevronUp, ChevronDown } from 'lucide-react';
import { Receipt } from './Receipt';

interface SalesProps {
    business: Business;
    onAddSale: (newSale: Sale) => void;
}

// Interface pour une ligne de produit dans le formulaire
interface SaleLineItem {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export const Sales: React.FC<SalesProps> = ({ business, onAddSale }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Sale; direction: 'asc' | 'desc' } | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [formData, setFormData] = useState<{
        date: string;
        clientId: string;
        clientName: string;
        saleType: 'RETAIL' | 'WHOLESALE';
        lineItems: SaleLineItem[];
    }>({ 
        date: new Date().toISOString().split('T')[0], 
        clientId: '', 
        clientName: '', 
        saleType: 'RETAIL',
        lineItems: [{
            id: Date.now().toString(),
            productId: '',
            productName: '',
            quantity: 1,
            unitPrice: 0
        }]
    });

    // État pour gérer l'affichage des détails de la vente
    const [showSaleDetails, setShowSaleDetails] = useState(false);

    // Utiliser useMemo pour s'assurer que les données sont rechargées lorsque l'entreprise change
    const businessId = useMemo(() => business.id, [business.id]);
    
    const { data: sales = [], isLoading: salesLoading } = useSales(businessId);
    const { data: products = [], isLoading: productsLoading } = useProducts(businessId);
    const { data: clients = [], isLoading: clientsLoading } = useClients(businessId);
    const createSaleMutation = useCreateSale();

    // Convert database sale objects to Sale type
    const formattedSales: Sale[] = useMemo(() => {
        return sales.map((sale: any) => ({
            ...sale,
            date: typeof sale.date === 'string' ? sale.date : sale.date.toISOString().split('T')[0],
            saleType: sale.saleType as 'RETAIL' | 'WHOLESALE'
        }));
    }, [sales]);

    const handleOpenModal = () => {
        setFormData({ 
            date: new Date().toISOString().split('T')[0], 
            clientId: '', 
            clientName: '', 
            saleType: "RETAIL",
            lineItems: [{
                id: Date.now().toString(),
                productId: '',
                productName: '',
                quantity: 1,
                unitPrice: 0
            }]
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find((c: any) => c.id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId,
                clientName: client.name
            }));
        }
    };

    const handleSaleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const saleType = e.target.value as 'RETAIL' | 'WHOLESALE';
        setFormData(prev => ({
            ...prev,
            saleType
        }));
    };

    // Gestion des lignes de produits
    const addLineItem = () => {
        setFormData(prev => ({
            ...prev,
            lineItems: [
                ...prev.lineItems,
                {
                    id: Date.now().toString(),
                    productId: '',
                    productName: '',
                    quantity: 1,
                    unitPrice: 0
                }
            ]
        }));
    };

    const removeLineItem = (id: string) => {
        if (formData.lineItems.length > 1) {
            setFormData(prev => ({
                ...prev,
                lineItems: prev.lineItems.filter(item => item.id !== id)
            }));
        }
    };

    const updateLineItem = (id: string, field: keyof SaleLineItem, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            lineItems: prev.lineItems.map(item => 
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
    };

    const handleProductChange = (lineItemId: string, productId: string) => {
        const product = products.find((p: any) => p.id === productId);
        if (product) {
            updateLineItem(lineItemId, 'productId', productId);
            updateLineItem(lineItemId, 'productName', product.name);
            updateLineItem(lineItemId, 'unitPrice', 
                formData.saleType === 'WHOLESALE' ? product.wholesalePrice : product.retailPrice
            );
            
            // Mettre à jour automatiquement la quantité si le stock est inférieur à 1
            if (product.stock < 1) {
                updateLineItem(lineItemId, 'quantity', 0);
            }
        }
    };

    // Fonction pour calculer le total d'une ligne de vente
    const calculateLineTotal = (quantity: number, unitPrice: number) => {
        return quantity * unitPrice;
    };

    // Fonction pour calculer le total de la vente
    const calculateSaleTotal = () => {
        return formData.lineItems.reduce((total, item) => {
            return total + calculateLineTotal(item.quantity, item.unitPrice);
        }, 0);
    };

    // Fonction pour vérifier la disponibilité du stock
    const checkStockAvailability = (productId: string, quantity: number) => {
        const product = products.find((p: any) => p.id === productId);
        if (product) {
            return product.stock >= quantity;
        }
        return false;
    };

    // Fonction pour obtenir la couleur en fonction de la disponibilité du stock
    const getStockColor = (productId: string, quantity: number) => {
        const product = products.find((p: any) => p.id === productId);
        if (product) {
            if (product.stock >= quantity) {
                return 'text-green-600';
            } else if (product.stock > 0) {
                return 'text-yellow-600';
            } else {
                return 'text-red-600';
            }
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form based on sale type
        if (formData.saleType === 'WHOLESALE' && !formData.clientId) {
            alert('Veuillez sélectionner un client pour les ventes en gros');
            return;
        }
        
        // Validate line items
        for (const item of formData.lineItems) {
            if (!item.productId || item.quantity <= 0 || item.unitPrice <= 0) {
                alert('Veuillez remplir tous les champs des produits');
                return;
            }
            
            // Vérifier la disponibilité du stock
            if (!checkStockAvailability(item.productId, item.quantity)) {
                const product = products.find((p: any) => p.id === item.productId);
                if (product) {
                    alert(`Stock insuffisant pour le produit ${product.name}. Stock disponible : ${product.stock}`);
                    return;
                }
            }
        }
        
        // Create separate sales for each line item
        for (const item of formData.lineItems) {
            const total = item.quantity * item.unitPrice;
            
            // Calculer le profit (exemple simple)
            const profit = total - (item.unitPrice * 0.8 * item.quantity); // 20% de marge
            
            const saleData: any = { 
                date: formData.date,
                clientId: formData.saleType === 'RETAIL' && !formData.clientId ? '' : formData.clientId,
                clientName: formData.saleType === 'RETAIL' && !formData.clientId ? 'Client Comptoir' : formData.clientName,
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: 0,
                tax: 0,
                total,
                profit,
                saleType: formData.saleType,
                paymentStatus: 'PAID',
                paymentMethod: 'CASH',
                userId: undefined,
                businessId: business.id,
                reference: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            await createSaleMutation.mutateAsync({ 
                businessId: business.id, 
                data: saleData
            });
        }
        
        handleCloseModal();
    };
    
    const handlePrintReceipt = (saleId: string) => {
        // Trouver la vente correspondante
        const sale = sales.find(s => s.id === saleId);
        if (!sale) return;
        
        // Trouver le client correspondant
        const client = clients.find(c => c.id === sale.clientId) || null;
        
        // Trouver le produit correspondant
        const product = products.find(p => p.id === sale.productId) || null;
        
        // Afficher le reçu (dans une vraie implémentation, on afficherait une modale ou une nouvelle page)
        console.log("Imprimer le reçu pour la vente:", sale, client, product);
    };
    
    // Regrouper les ventes par date et client pour créer des reçus
    const groupedSales = useMemo(() => {
        return formattedSales.reduce((acc: Record<string, Sale[]>, sale) => {
            const key = `${sale.date}-${sale.clientId}`;
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(sale);
            return acc;
        }, {});
    }, [formattedSales]);
    
    // Fonction pour filtrer les ventes par date
    const filteredSales = useMemo(() => {
        if (!startDate && !endDate) return formattedSales;
        
        return formattedSales.filter(sale => {
            const saleDate = new Date(sale.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;
            
            if (start && saleDate < start) return false;
            if (end && saleDate > end) return false;
            return true;
        });
    }, [formattedSales, startDate, endDate]);
    
    // Fonction de tri appliquée aux ventes filtrées
    const sortedAndFilteredSales = useMemo(() => {
        if (!sortConfig) return filteredSales;
        
        return [...filteredSales].sort((a, b) => {
            if (!sortConfig) return 0;
            
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            
            // Gérer les valeurs null ou undefined
            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
            if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;
            
            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [filteredSales, sortConfig]);
    
    // Colonnes du tableau
    const columns = useMemo(() => [
        { 
            header: 'Date', 
            accessor: 'date' as keyof Sale,
            sortable: true
        },
        { 
            header: 'Client', 
            accessor: 'clientName' as keyof Sale,
            sortable: true
        },
        { 
            header: 'Produit', 
            accessor: 'productName' as keyof Sale,
            sortable: true
        },
        { 
            header: 'Quantité', 
            accessor: 'quantity' as keyof Sale,
            sortable: true,
            render: (item: Sale) => (
                <span className={getStockColor(item.productId || '', item.quantity)}>
                    {item.quantity}
                </span>
            )
        },
        { 
            header: 'Prix Unitaire', 
            accessor: 'unitPrice' as keyof Sale,
            sortable: true,
            render: (item: Sale) => `${item.unitPrice.toLocaleString('fr-FR')} FCFA`
        },
        { 
            header: 'Total', 
            accessor: 'total' as keyof Sale,
            sortable: true,
            render: (item: Sale) => `${item.total.toLocaleString('fr-FR')} FCFA`
        },
        { 
            header: 'Type', 
            accessor: 'saleType' as keyof Sale,
            sortable: true
        },
        {
            header: 'Actions',
            accessor: 'id' as keyof Sale,
            render: (item: Sale) => (
                <div className="flex space-x-2">
                    <Button 
                        variant="secondary"
                        onClick={() => handlePrintReceipt(item.id)}
                        icon={<Printer size={16} />}
                    >
                        Imprimer
                    </Button>
                </div>
            )
        }
    ], [products]);
    
    // Fonction pour gérer le tri
    const handleSort = (key: keyof Sale) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };
    
    if (salesLoading || productsLoading || clientsLoading) {
        return <div className="flex w-full h-screen flex-col justify-center items-center  space-y-4"><div className="flex items-center space-x-4 p-6"><div className="relative"><div className="w-12 h-12 border-4 border-orange-200 rounded-full"></div><div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div></div><div className="space-y-2"><p className="font-semibold text-gray-800">Ventes</p><p className="text-sm text-gray-600 animate-pulse">Chargement en cours...</p></div></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Ventes - {business.name}</h1>
                <Button onClick={handleOpenModal} icon={<Plus size={16} />}>Ajouter une Vente</Button>
            </div>
            
            {/* Filtres de date */}
            <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button 
                            variant="secondary" 
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setSortConfig(null);
                            }}
                        >
                            Réinitialiser les filtres
                        </Button>
                    </div>
                </div>
            </div>
            
            <Table 
                columns={columns} 
                data={sortedAndFilteredSales} 
                onSort={handleSort}
                sortConfig={sortConfig}
            />
            
            <Modal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                title="Ajouter une Vente"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="saleType" className="block text-sm font-medium text-gray-700 mb-1">Type de Vente</label>
                            <select
                                id="saleType"
                                name="saleType"
                                value={formData.saleType}
                                onChange={handleSaleTypeChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                required
                            >
                                <option value="RETAIL">Vente au détail</option>
                                <option value="WHOLESALE">Vente en gros</option>
                            </select>
                        </div>
                        
                        {(formData.saleType === 'WHOLESALE' || formData.clientId) && (
                            <div>
                                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                                    {formData.saleType === 'WHOLESALE' ? 'Client *' : 'Client (optionnel)'}
                                </label>
                                <select
                                    id="clientId"
                                    name="clientId"
                                    value={formData.clientId}
                                    onChange={handleClientChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required={formData.saleType === 'WHOLESALE'}
                                >
                                    <option value="">Sélectionner un client</option>
                                    {clients.map((client: any) => (
                                        <option key={client.id} value={client.id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold">Produits</h3>
                            <Button type="button" onClick={addLineItem} variant="secondary" icon={<Plus size={16} />}>
                                Ajouter un produit
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            {formData.lineItems.map((item, index) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg">
                                    <div className="md:col-span-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Produit</label>
                                        <select
                                            value={item.productId}
                                            onChange={(e) => handleProductChange(item.id, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        >
                                            <option value="">Sélectionner un produit</option>
                                            {products.map((product: any) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} - {product.retailPrice.toLocaleString('fr-FR')} FCFA (détail) / {product.wholesalePrice.toLocaleString('fr-FR')} FCFA (gros)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantité</label>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${getStockColor(item.productId, item.quantity) === 'text-red-600' ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                            min="1"
                                            required
                                        />
                                        {item.productId && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                Stock disponible: {products.find(p => p.id === item.productId)?.stock || 0}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Prix Unitaire (FCFA)</label>
                                        <input
                                            type="number"
                                            value={item.unitPrice}
                                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            min="0"
                                            required
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            Total ligne: {calculateLineTotal(item.quantity, item.unitPrice).toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>
                                    
                                    <div className="md:col-span-2 flex items-end">
                                        <Button 
                                            type="button"
                                            variant="danger"
                                            onClick={() => removeLineItem(item.id)}
                                            disabled={formData.lineItems.length <= 1}
                                            icon={<Trash2 size={16} />}
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Total de la vente</h3>
                            <p className="text-2xl font-bold text-primary-600">{calculateSaleTotal().toLocaleString('fr-FR')} FCFA</p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button variant="secondary" onClick={handleCloseModal}>Annuler</Button>
                            <Button type="submit">Enregistrer la Vente</Button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};