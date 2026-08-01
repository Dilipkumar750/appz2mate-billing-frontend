import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import {
  DollarSign, Plus, Search, Edit2, Trash2, X,
  Calendar, TrendingUp, TrendingDown, Download, Receipt,
  Building2, Car, Utensils, ShoppingBag, Wifi, Briefcase
} from 'lucide-react';
import {
  BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const expenseCategories = [
  { name: 'Rent', icon: Building2, color: '#3B82F6' },
  { name: 'Salaries', icon: Briefcase, color: '#10B981' },
  { name: 'Utilities', icon: Wifi, color: '#F59E0B' },
  { name: 'Transport', icon: Car, color: '#8B5CF6' },
  { name: 'Food & Dining', icon: Utensils, color: '#EC4899' },
  { name: 'Supplies', icon: ShoppingBag, color: '#06B6D4' },
  { name: 'Marketing', icon: TrendingUp, color: '#F97316' },
  { name: 'Other', icon: DollarSign, color: '#6366F1' },
];

const paymentMethods = ['Cash', 'Bank Transfer', 'Credit Card', 'UPI', 'Cheque'];

const Expenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    paymentMethod: 'Cash',
    date: new Date().toISOString().split('T')[0]
  });

  // Stats
  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const monthlyExpenses = useMemo(() =>
    expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth() && new Date(e.date).getFullYear() === new Date().getFullYear())
      .reduce((sum, e) => sum + e.amount, 0), [expenses]);
  const averageExpense = expenses.length ? totalExpenses / expenses.length : 0;

  const categoryBreakdown = useMemo(() =>
    expenseCategories.map(cat => ({
      name: cat.name,
      amount: expenses.filter(e => e.category === cat.name).reduce((sum, e) => sum + e.amount, 0),
      color: cat.color
    })).filter(c => c.amount > 0), [expenses]);

  const monthlyData = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthExp = expenses
        .filter(e => new Date(e.date).getMonth() === date.getMonth() && new Date(e.date).getFullYear() === date.getFullYear())
        .reduce((sum, e) => sum + e.amount, 0);
      return { month: date.toLocaleString('default', { month: 'short' }), expenses: monthExp };
    }), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchSearch = exp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.category?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === 'all' || exp.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingExpense) {
      // BUG FIX: was editingExpense.id — now correctly uses ._id
      await updateExpense(editingExpense._id, expenseData);
    } else {
      await addExpense(expenseData);
    }

    setShowModal(false);
    setEditingExpense(null);
    setFormData({ category: '', amount: '', description: '', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0] });
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category || '',
      amount: expense.amount?.toString() || '',
      description: expense.description || '',
      paymentMethod: expense.paymentMethod || 'Cash',
      date: expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this expense entry?')) {
      // BUG FIX: was expense.id — now correctly uses _id passed directly
      deleteExpense(id);
    }
  };

  const openAddModal = () => {
    setEditingExpense(null);
    setFormData({ category: '', amount: '', description: '', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const getCategoryIcon = (catName) => {
    const cat = expenseCategories.find(c => c.name === catName);
    return cat ? cat.icon : DollarSign;
  };

  const getCategoryColor = (catName) => {
    const cat = expenseCategories.find(c => c.name === catName);
    return cat ? cat.color : '#6366F1';
  };

  const exportCsv = () => {
    const header = 'Date,Category,Description,Amount,Payment Method\r\n';
    const rows = expenses.map(e =>
      `${new Date(e.date).toLocaleDateString()},${e.category},"${e.description}",${e.amount},${e.paymentMethod}`
    ).join('\r\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + header + rows;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `expenses_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Expense Tracking</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Monitor and manage all business expenses</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition"
          >
            <Download size={15} />
            Export CSV
          </button>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition"
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Expenses', value: `₹${totalExpenses.toLocaleString('en-IN')}`, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', Icon: DollarSign },
          { label: 'This Month', value: `₹${monthlyExpenses.toLocaleString('en-IN')}`, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', Icon: Calendar },
          { label: 'Average per Entry', value: `₹${averageExpense.toFixed(0)}`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', Icon: TrendingUp },
          { label: 'Total Entries', value: expenses.length, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20', Icon: Receipt },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className={`text-xl font-extrabold mt-1 ${s.color}`}>{s.value}</p>
            </div>
            <div className={`p-2.5 rounded-xl ${s.bg}`}>
              <s.Icon size={20} className={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Expense Trend (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
                formatter={v => [`₹${v.toLocaleString('en-IN')}`, 'Expenses']}
              />
              <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2.5} dot={{ fill: '#EF4444', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Expense by Category</h3>
          {categoryBreakdown.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="amount" paddingAngle={3}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto max-h-40">
                {categoryBreakdown.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white flex-shrink-0">₹{cat.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm border border-dashed border-slate-200 dark:border-slate-600 rounded-2xl">
              No expense data available
            </div>
          )}
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search expenses..."
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
            {expenseCategories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {searchTerm || categoryFilter !== 'all' ? 'No matching expenses found' : 'No expenses recorded yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase">Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase">Category</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden md:table-cell">Description</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase">Amount</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden sm:table-cell">Method</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredExpenses.map((expense) => {
                  const Icon = getCategoryIcon(expense.category);
                  const color = getCategoryColor(expense.category);
                  return (
                    // BUG FIX: using expense._id as key instead of expense.id
                    <tr key={expense._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(expense.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg flex-shrink-0" style={{ background: color + '20' }}>
                            <Icon size={13} style={{ color }} />
                          </div>
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{expense.category}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 hidden md:table-cell max-w-[200px] truncate">{expense.description}</td>
                      <td className="px-5 py-3.5 font-bold text-red-600 dark:text-red-400">₹{expense.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">{expense.paymentMethod}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-slate-500 hover:text-blue-600 transition"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(expense._id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-600 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
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
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
                <textarea
                  rows="3"
                  placeholder="Enter expense description..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                >
                  {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 py-3 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition">
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

export default Expenses;