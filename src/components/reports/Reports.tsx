import React, { useState, useMemo } from 'react';
import type { Business, Sale, Expense } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { DateFilter } from '../shared';

interface ReportsProps {
    business: Business;
    hideFilters?: boolean;
}

const processMonthlyData = (sales: Sale[], expenses: Expense[]) => {
    const data: { [key: string]: { name: string; ventes: number; depenses: number } } = {};
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    const processItems = (items: (Sale | Expense)[], type: 'ventes' | 'depenses') => {
        items.forEach(item => {
            const date = new Date(item.date);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;
            const amount = type === 'ventes' ? (item as Sale).total : (item as Expense).amount;
            
            if (!data[key]) {
                data[key] = { name: `${monthNames[month]} '${String(year).slice(2)}`, ventes: 0, depenses: 0 };
            }
            data[key][type] += amount;
        });
    };

    processItems(sales, 'ventes');
    processItems(expenses, 'depenses');

    return Object.values(data).sort((a,b) => {
        const [aMonth, aYear] = a.name.split(" '");
        const [bMonth, bYear] = b.name.split(" '");
        return new Date(`${aMonth} 1, 20${aYear}`).getTime() - new Date(`${bMonth} 1, 20${bYear}`).getTime();
    });
};


const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`${value.toLocaleString('fr-FR')} FCFA`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Taux ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const BestSellingProductsCard: React.FC<{ products: { productId: string; productName: string; totalQuantity: number; totalRevenue: number; }[] }> = ({ products }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Produits les Plus Rentables</h3>
        <ul className="space-y-3">
            <li className="flex justify-between text-xs font-bold text-gray-500 uppercase px-2">
                <span>Produit</span>
                <div className="flex space-x-4">
                    <span className="w-16 text-right">Quantité</span>
                    <span className="w-24 text-right">Revenu</span>
                </div>
            </li>
            {products.length > 0 ? products.map(p => (
                <li key={p.productId} className="flex justify-between items-center text-sm border-t pt-3 px-2">
                    <p className="font-semibold text-gray-700 truncate pr-2" title={p.productName}>{p.productName}</p>
                    <div className="flex space-x-4 font-mono flex-shrink-0">
                        <span className="w-16 text-right">{p.totalQuantity}</span>
                        <span className="w-24 text-right font-bold text-primary-600">{p.totalRevenue.toLocaleString('fr-FR')}</span>
                    </div>
                </li>
            )) : <p className="text-gray-500 text-center py-4">Aucune vente pour la période sélectionnée.</p>}
        </ul>
    </div>
);

const InventoryValuationCard: React.FC<{ valuation: { totalRetailValue: number; totalWholesaleValue: number; } }> = ({ valuation }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Valorisation des Stocks</h3>
        <div className="space-y-4 mt-8">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <div>
                    <p className="font-semibold text-blue-800">Valeur au Prix de Détail</p>
                    <p className="text-xs text-blue-600">Potentiel de revenu</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{valuation.totalRetailValue.toLocaleString('fr-FR')} FCFA</p>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                 <div>
                    <p className="font-semibold text-purple-800">Valeur au Prix de Gros</p>
                    <p className="text-xs text-purple-600">Coût de l'inventaire</p>
                </div>
                <p className="text-2xl font-bold text-purple-600">{valuation.totalWholesaleValue.toLocaleString('fr-FR')} FCFA</p>
            </div>
        </div>
    </div>
);

const CustomProfitTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm text-green-600">{`Profit: ${data.totalProfit.toLocaleString('fr-FR')} FCFA`}</p>
        <p className="text-sm text-gray-600">{`Quantité Vendue: ${data.totalQuantity}`}</p>
        <p className="text-sm text-purple-600">{`Prix de Gros: ${data.wholesalePrice.toLocaleString('fr-FR')} FCFA`}</p>
      </div>
    );
  }
  return null;
};

const ProductProfitChart: React.FC<{ 
    data: { productName: string; totalProfit: number; totalQuantity: number; wholesalePrice: number; }[],
    sortKey: 'totalProfit' | 'totalQuantity',
    setSortKey: (key: 'totalProfit' | 'totalQuantity') => void
}> = ({ data, sortKey, setSortKey }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Analyse de Rentabilité par Produit</h3>
            <div className="flex space-x-2">
                 <button 
                    onClick={() => setSortKey('totalProfit')}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${sortKey === 'totalProfit' ? 'bg-primary-600 text-white font-semibold shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                   Trier par Profit
                </button>
                <button 
                     onClick={() => setSortKey('totalQuantity')}
                     className={`px-3 py-1 text-sm rounded-full transition-colors ${sortKey === 'totalQuantity' ? 'bg-primary-600 text-white font-semibold shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Trier par Quantité
                </button>
            </div>
        </div>
        {data.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(value) => new Intl.NumberFormat('fr-FR').format(value as number)} />
                    <YAxis type="category" dataKey="productName" width={150} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomProfitTooltip />} cursor={{ fill: 'rgba(239, 246, 255, 0.5)' }}/>
                    <Legend />
                    <Bar dataKey="totalProfit" name="Profit" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="flex items-center justify-center h-48">
                <p className="text-gray-500">Aucune donnée de profit à afficher pour la période sélectionnée.</p>
            </div>
        )}
    </div>
);


export const Reports: React.FC<ReportsProps> = ({ business, hideFilters = false }) => {
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [activeIndex, setActiveIndex] = useState(0);
    const [profitSortKey, setProfitSortKey] = useState<'totalProfit' | 'totalQuantity'>('totalProfit');

    const filteredData = useMemo(() => {
        const { start, end } = dateRange;
        const startDate = start ? new Date(start) : null;
        const endDate = end ? new Date(end) : null;

        if (!startDate || !endDate) {
            return { sales: business.sales, expenses: business.expenses };
        }
        
        // Add 1 day to end date to make it inclusive
        endDate.setDate(endDate.getDate() + 1);

        const sales = business.sales.filter(s => {
            const saleDate = new Date(s.date);
            return saleDate >= startDate && saleDate <= endDate;
        });

        const expenses = business.expenses.filter(e => {
            const expDate = new Date(e.date);
            return expDate >= startDate && expDate <= endDate;
        });

        return { sales, expenses };
    }, [business, dateRange]);

    const monthlyChartData = useMemo(() => {
        return processMonthlyData(filteredData.sales, filteredData.expenses);
    }, [filteredData.sales, filteredData.expenses]);

    const expenseByCategory = useMemo(() => {
        const categoryMap: { [key: string]: number } = {};
        filteredData.expenses.forEach(expense => {
            categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
        });
        return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    }, [filteredData.expenses]);
    
    const inventoryValuation = useMemo(() => {
        const totalRetailValue = business.products.reduce((sum, p) => sum + (p.stock * p.retailPrice), 0);
        const totalWholesaleValue = business.products.reduce((sum, p) => sum + (p.stock * p.wholesalePrice), 0);
        return { totalRetailValue, totalWholesaleValue };
    }, [business.products]);

    const bestSellingProducts = useMemo(() => {
        const productSales: { [key: string]: { productName: string; totalQuantity: number; totalRevenue: number } } = {};

        filteredData.sales.forEach(sale => {
            if (!productSales[sale.productId]) {
                productSales[sale.productId] = {
                    productName: sale.productName,
                    totalQuantity: 0,
                    totalRevenue: 0,
                };
            }
            productSales[sale.productId].totalQuantity += sale.quantity;
            productSales[sale.productId].totalRevenue += sale.total;
        });

        return Object.entries(productSales)
            .map(([productId, data]) => ({ productId, ...data }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10);
    }, [filteredData.sales]);
    
    const profitByProduct = useMemo(() => {
        const profitMap: { [key: string]: { productName: string; totalProfit: number; totalQuantity: number; wholesalePrice: number; } } = {};

        filteredData.sales.forEach(sale => {
            const product = business.products.find(p => p.id === sale.productId);
            if (!product) {
                return; // Skip if product not found
            }

            const saleProfit = (sale.unitPrice - product.wholesalePrice) * sale.quantity;

            if (!profitMap[sale.productId]) {
                profitMap[sale.productId] = {
                    productName: sale.productName,
                    totalProfit: 0,
                    totalQuantity: 0,
                    wholesalePrice: product.wholesalePrice,
                };
            }
            profitMap[sale.productId].totalProfit += saleProfit;
            profitMap[sale.productId].totalQuantity += sale.quantity;
        });

        return Object.values(profitMap)
            .sort((a, b) => b[profitSortKey] - a[profitSortKey])
            .slice(0, 15); // Show top 15
    }, [filteredData.sales, business.products, profitSortKey]);


    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    // FIX: The `activeIndex` prop is valid for the Pie component but missing in some versions of @types/recharts.
    // We cast it to `any` to bypass the TypeScript error.
    const activeIndexProp: any = { activeIndex };

    const handleDateRangeChange = (start: string, end: string) => {
        setDateRange({ start, end });
    };

    return (
        <div className="space-y-6">
            {!hideFilters && (
                <>
                    <h1 className="text-3xl font-bold text-gray-800">Rapports</h1>

                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <DateFilter onDateRangeChange={handleDateRangeChange} />
                    </div>
                </>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Aperçu Mensuel (Ventes vs Dépenses)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('fr-FR').format(value as number)} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                }}
                                formatter={(value) => `${(value as number).toLocaleString('fr-FR')} FCFA`}
                            />
                            <Legend />
                            <Bar dataKey="ventes" fill="#3b82f6" name="Ventes" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="depenses" fill="#ef4444" name="Dépenses" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Répartition des Dépenses</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                             <Pie 
                                {...activeIndexProp}
                                activeShape={renderActiveShape} 
                                data={expenseByCategory} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={60}
                                outerRadius={80} 
                                fill="#8884d8"
                                dataKey="value"
                                onMouseEnter={onPieEnter}
                            >
                                {expenseByCategory.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <BestSellingProductsCard products={bestSellingProducts} />
                <InventoryValuationCard valuation={inventoryValuation} />
                <div className="lg:col-span-2">
                    <ProductProfitChart 
                        data={profitByProduct}
                        sortKey={profitSortKey}
                        setSortKey={setProfitSortKey} 
                    />
                </div>
            </div>
        </div>
    );
};