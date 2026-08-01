import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { 
  Package, AlertTriangle, Plus, Minus, Search, 
  TrendingUp, TrendingDown, Calendar, Download
} from 'lucide-react';

const Inventory = () => {
  const { products, updateStock, getLowStockProducts, inventoryTransactions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [transactionType, setTransactionType] = useState('add');
  const [showStockModal, setShowStockModal] = useState(false);

  const lowStockProducts = useMemo(() => getLowStockProducts ? getLowStockProducts() : [], [products]);
  
  // Calculations
  const totalStockValue = useMemo(() => products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0), [products]);
  const totalItems = useMemo(() => products.reduce((sum, p) => sum + (p.stock || 0), 0), [products]);
  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.hsn?.includes(searchTerm);
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const handleStockUpdate = async () => {
    if (selectedProduct && quantity > 0) {
      await updateStock(selectedProduct._id, quantity, transactionType);
      setShowStockModal(false);
      setSelectedProduct(null);
      setQuantity(1);
    }
  };

  const exportStockCsv = () => {
    const header = 'Product,Category,Price,Current Stock,Low Stock Limit,HSN\r\n';
    const rows = products.map(p =>
      `"${p.name}",${p.category || 'Other'},${p.price},${p.stock},${p.lowStock || 0},${p.hsn || ''}`
    ).join('\r\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + header + rows;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `inventory_status_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statsCards = [
    { title: 'Total Stock Value', value: `₹${totalStockValue.toLocaleString('en-IN')}`, icon: Package, iconBg: 'bg-blue-100 dark:bg-blue-900/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { title: 'Total Units', value: totalItems, icon: Package, iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Low Stock Alerts', value: lowStockProducts.length, icon: AlertTriangle, iconBg: 'bg-red-100 dark:bg-red-900/30', iconColor: 'text-red-600 dark:text-red-400' },
    { title: 'Catalog Items', value: products.length, icon: TrendingUp, iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400' },
  ];

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Inventory Management</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Track stock levels, monitor alerts, and record manual audit corrections</p>
        </div>
        <button
          onClick={exportStockCsv}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition self-start sm:self-auto font-sans"
        >
          <Download size={15} />
          <span>Export Stock (CSV)</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-slate-400 font-medium">{stat.title}</p>
                <p className="text-xl font-extrabold mt-1.5 text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                <Icon className={stat.iconColor} size={20} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 text-red-800 dark:text-red-400 font-bold text-sm">
            <AlertTriangle size={18} />
            <h3>Low Stock Alert List</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {lowStockProducts.map(product => (
              <div key={product._id} className="flex justify-between items-center bg-white dark:bg-slate-800 rounded-xl p-3 border border-red-100 dark:border-red-900/50 shadow-sm">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-xs truncate">{product.name}</p>
                  <p className="text-[10px] text-red-500 font-medium mt-0.5">Stock Left: {product.stock} {product.unit}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedProduct(product);
                    setTransactionType('add');
                    setShowStockModal(true);
                  }}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold transition flex-shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search products in inventory catalog..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-sm cursor-pointer focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Price</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Current Stock</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Stock Level Bar</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= (product.lowStock || 0);
                const percent = Math.min(100, Math.max(0, product.lowStock > 0 ? (product.stock / (product.lowStock * 3)) * 100 : 100));
                
                return (
                  <tr key={product._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-white">{product.name}</p>
                        {product.hsn && <p className="text-[10px] text-slate-400 mt-0.5">HSN: {product.hsn}</p>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{product.category || 'Other'}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">₹{product.price?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 font-bold">
                      <span className={isLowStock ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="w-28 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isLowStock ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        isLowStock 
                          ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800'
                      }`}>
                        {isLowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setTransactionType('add');
                            setShowStockModal(true);
                          }}
                          className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 transition border border-emerald-100 dark:border-emerald-800"
                          title="Add Stock"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProduct(product);
                            setTransactionType('reduce');
                            setShowStockModal(true);
                          }}
                          className="p-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 transition border border-red-100 dark:border-red-800"
                          title="Remove Stock"
                        >
                          <Minus size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Ledger Logs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-5">
        <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Stock Audit Ledger</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {inventoryTransactions.slice(0, 15).map(transaction => (
            <div key={transaction._id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                {transaction.type === 'add' ? (
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <TrendingUp size={15} />
                  </div>
                ) : (
                  <div className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg">
                    <TrendingDown size={15} />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">{transaction.productName}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {transaction.type === 'add' ? 'Added' : 'Removed'} {transaction.quantity} units • Final Stock: {transaction.balanceStock}
                  </p>
                </div>
              </div>
              <div className="text-right text-[10px] text-slate-400">
                <p>{new Date(transaction.date || transaction.createdAt).toLocaleDateString('en-IN')}</p>
                <p className="mt-0.5">{new Date(transaction.date || transaction.createdAt).toLocaleTimeString('en-IN')}</p>
              </div>
            </div>
          ))}
          {inventoryTransactions.length === 0 && (
            <p className="text-center text-slate-400 py-6 text-sm">No inventory audits recorded yet</p>
          )}
        </div>
      </div>

      {/* Stock Update Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              {transactionType === 'add' ? 'Replenish Inventory' : 'Reduce Inventory'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Product</label>
                <p className="text-slate-800 dark:text-white font-bold text-sm">{selectedProduct.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Current Stock: {selectedProduct.stock} {selectedProduct.unit}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1.5 tracking-wider">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleStockUpdate}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-500/20"
                >
                  Save Stock Update
                </button>
                <button
                  onClick={() => {
                    setShowStockModal(false);
                    setSelectedProduct(null);
                  }}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Inventory;