import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Package, X, Tag, Hash, DollarSign, AlertTriangle } from 'lucide-react';

const CATEGORY_COLORS = {
  Electronics: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Furniture: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Stationery: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Clothing: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Services: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Medical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Other: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other;

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '', category: '', price: '', gst: '', hsn: '', unit: 'piece', stock: '', lowStock: ''
  });

  const categories = ['Electronics', 'Furniture', 'Stationery', 'Clothing', 'Food', 'Services', 'Medical', 'Other'];

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.hsn?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      gst: parseFloat(formData.gst) || 0,
      stock: parseInt(formData.stock) || 0,
      lowStock: parseInt(formData.lowStock) || 0,
    };

    if (editingProduct) {
      // BUG FIX: was editingProduct.id — now correctly uses editingProduct._id
      await updateProduct(editingProduct._id, productData);
    } else {
      await addProduct(productData);
    }

    setShowModal(false);
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', gst: '', hsn: '', unit: 'piece', stock: '', lowStock: '' });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      category: product.category || '',
      price: product.price?.toString() || '',
      gst: product.gst?.toString() || '',
      hsn: product.hsn || '',
      unit: product.unit || 'piece',
      stock: product.stock?.toString() || '',
      lowStock: product.lowStock?.toString() || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this product from your catalog?')) {
      // BUG FIX: now correctly uses _id
      deleteProduct(id);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', gst: '', hsn: '', unit: 'piece', stock: '', lowStock: '' });
    setShowModal(true);
  };

  const totalValue = products.reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0);
  const lowStockCount = products.filter(p => p.stock <= p.lowStock && p.lowStock > 0).length;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Products &amp; Services</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Manage your product catalog with GST rates and HSN codes</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: products.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Catalog Value', value: `₹${totalValue.toLocaleString('en-IN')}`, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Low Stock', value: lowStockCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Categories', value: [...new Set(products.map(p => p.category))].length, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm"
          >
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-extrabold mt-1.5 ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search products, HSN codes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-slate-200 text-sm cursor-pointer focus:outline-none"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-16 text-center">
            <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {searchTerm || categoryFilter !== 'all' ? 'No products match your search' : 'No products added yet'}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first product to the catalog'}
            </p>
            {!searchTerm && categoryFilter === 'all' && (
              <button onClick={openAddModal} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Product</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Category</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">GST</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell">HSN</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Stock</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredProducts.map((product, index) => {
                  const isLowStock = product.stock <= product.lowStock && product.lowStock > 0;
                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${getCategoryColor(product.category)}`}>
                            {product.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white truncate">{product.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">{product.unit}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
                          {product.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">₹{product.price?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400 hidden md:table-cell">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs font-medium">{product.gst}%</span>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500 dark:text-slate-400 hidden lg:table-cell">{product.hsn || '—'}</td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                            {product.stock ?? '—'}
                          </span>
                          {isLowStock && <AlertTriangle size={12} className="text-red-500" />}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Product / Service Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dell Laptop i7"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kg</option>
                    <option value="gram">Gram</option>
                    <option value="litre">Litre</option>
                    <option value="meter">Meter</option>
                    <option value="hour">Hour</option>
                    <option value="day">Day</option>
                    <option value="month">Month</option>
                    <option value="box">Box</option>
                    <option value="set">Set</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">GST Rate (%)</label>
                  <select
                    value={formData.gst}
                    onChange={e => setFormData({ ...formData, gst: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                    required
                  >
                    <option value="">Select GST</option>
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Opening Stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Low Stock Alert</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={formData.lowStock}
                    onChange={e => setFormData({ ...formData, lowStock: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">HSN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 8471"
                  value={formData.hsn}
                  onChange={e => setFormData({ ...formData, hsn: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20"
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Products;