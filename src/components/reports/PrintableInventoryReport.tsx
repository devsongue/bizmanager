"use client";

import React, { useEffect, useRef } from 'react';
import type { Product } from '@/types';

interface PrintableInventoryReportProps {
  products: Product[];
  businessName: string;
  onPrintComplete?: () => void;
}

export const PrintableInventoryReport: React.FC<PrintableInventoryReportProps> = ({ 
  products, 
  businessName,
  onPrintComplete 
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Calculer les totaux
  const totalItems = products.length;
  const totalStockValue = products.reduce((sum, product) => 
    sum + (product.stock || 0) * (product.wholesalePrice || 0), 0);
  const totalRetailValue = products.reduce((sum, product) => 
    sum + (product.stock || 0) * (product.retailPrice || 0), 0);

  // Grouper les produits par catégorie
  const productsByCategory: { [key: string]: Product[] } = {};
  products.forEach(product => {
    const category = product.category || 'Non catégorisé';
    if (!productsByCategory[category]) {
      productsByCategory[category] = [];
    }
    productsByCategory[category].push(product);
  });

  // Imprimer automatiquement quand le composant est monté
  useEffect(() => {
    const handlePrint = () => {
      const printContent = printRef.current;
      if (printContent) {
        const originalContents = document.body.innerHTML;
        document.body.innerHTML = printContent.innerHTML;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Recharger la page après l'impression
        
        if (onPrintComplete) {
          onPrintComplete();
        }
      }
    };

    // Attendre un peu que le contenu soit rendu
    const timer = setTimeout(handlePrint, 500);
    return () => clearTimeout(timer);
  }, [onPrintComplete]);

  // Formatage de la date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div ref={printRef} className="print-container p-8 max-w-4xl mx-auto">
      {/* Styles pour l'impression */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print-container {
            font-size: 12px;
            line-height: 1.4;
            color: #000;
          }
          
          .no-print {
            display: none !important;
          }
          
          .page-break {
            page-break-before: always;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          th, td {
            border: 1px solid #000;
            padding: 6px 8px;
            text-align: left;
          }
          
          th {
            background-color: #f0f0f0;
            font-weight: bold;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .header-section {
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-style: italic;
            font-size: 10px;
          }
        }
        
        /* Styles pour l'aperçu */
        .print-container {
          font-family: Arial, sans-serif;
        }
        
        .header-section {
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 25px;
        }
        
        .report-title {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 5px;
        }
        
        .report-subtitle {
          font-size: 16px;
          text-align: center;
          color: #666;
          margin-bottom: 15px;
        }
        
        .report-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        
        .info-item {
          font-size: 14px;
        }
        
        .summary-box {
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 20px;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }
        
        .summary-item {
          text-align: center;
        }
        
        .summary-value {
          font-size: 20px;
          font-weight: bold;
          color: #007bff;
        }
        
        .summary-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
        }
        
        .category-header {
          background-color: #e9ecef;
          font-weight: bold;
          padding: 8px 12px;
          margin: 20px 0 10px 0;
          border-radius: 4px;
        }
        
        .footer {
          margin-top: 30px;
          text-align: center;
          font-style: italic;
          font-size: 12px;
          color: #666;
        }
      `}</style>

      {/* En-tête du rapport */}
      <div className="header-section">
        <div className="report-title">RAPPORT D'INVENTAIRE</div>
        <div className="report-subtitle">{businessName}</div>
        
        <div className="report-info">
          <div className="info-item">
            <strong>Date du rapport:</strong> {formatDate(new Date())}
          </div>
          <div className="info-item">
            <strong>Période:</strong> Inventaire actuel
          </div>
        </div>
      </div>

      {/* Résumé de l'inventaire */}
      <div className="summary-box">
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-value">{totalItems}</div>
            <div className="summary-label">Articles</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{products.reduce((sum, p) => sum + (p.stock || 0), 0)}</div>
            <div className="summary-label">Unités en stock</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totalStockValue.toLocaleString('fr-FR')} FCFA</div>
            <div className="summary-label">Valeur au coût</div>
          </div>
          <div className="summary-item">
            <div className="summary-value">{totalRetailValue.toLocaleString('fr-FR')} FCFA</div>
            <div className="summary-label">Valeur au détail</div>
          </div>
        </div>
      </div>

      {/* Liste des produits par catégorie */}
      {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
        <div key={category}>
          <div className="category-header">{category}</div>
          <table>
            <thead>
              <tr>
                <th>Nom du produit</th>
                <th className="text-center">Stock</th>
                <th className="text-right">Coût unitaire</th>
                <th className="text-right">Prix de détail</th>
                <th className="text-right">Valeur au coût</th>
                <th className="text-right">Valeur au détail</th>
              </tr>
            </thead>
            <tbody>
              {categoryProducts.map((product) => {
                const stockValue = (product.stock || 0) * (product.wholesalePrice || 0);
                const retailValue = (product.stock || 0) * (product.retailPrice || 0);
                
                return (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td className="text-center">{product.stock?.toLocaleString('fr-FR')}</td>
                    <td className="text-right">{(product.wholesalePrice || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td className="text-right">{(product.retailPrice || 0).toLocaleString('fr-FR')} FCFA</td>
                    <td className="text-right">{stockValue.toLocaleString('fr-FR')} FCFA</td>
                    <td className="text-right">{retailValue.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                );
              })}
              {/* Sous-total par catégorie */}
              <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                <td colSpan={4}>Sous-total {category}</td>
                <td className="text-right">
                  {categoryProducts.reduce((sum, p) => sum + (p.stock || 0) * (p.wholesalePrice || 0), 0).toLocaleString('fr-FR')} FCFA
                </td>
                <td className="text-right">
                  {categoryProducts.reduce((sum, p) => sum + (p.stock || 0) * (p.retailPrice || 0), 0).toLocaleString('fr-FR')} FCFA
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      {/* Pied de page */}
      <div className="footer">
        Rapport généré par BizManager - Système de gestion d'entreprise
      </div>
    </div>
  );
};