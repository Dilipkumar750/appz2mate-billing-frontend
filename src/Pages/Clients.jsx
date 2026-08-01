import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Search, X, Users, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600', 'from-emerald-400 to-emerald-600', 'from-violet-400 to-violet-600',
  'from-pink-400 to-pink-600', 'from-amber-400 to-amber-600', 'from-cyan-400 to-cyan-600',
];

const Clients = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, invoices } = useApp();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', gstNumber: '', address: '' });

  const filteredCustomers = useMemo(() =>
    customers.filter(c =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
    ), [customers, searchTerm]);

  const getCustomerBalance = (customerId) =>
    invoices.filter(inv => inv.customerId === customerId && inv.status === 'Pending')
      .reduce((sum, inv) => sum + inv.total, 0);

  const getCustomerInvoiceCount = (customerId) =>
    invoices.filter(inv => inv.customerId === customerId).length;

  const totalOutstandingBalance = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '', email: customer.email || '',
      phone: customer.phone || '', gstNumber: customer.gstNumber || '',
      address: customer.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this client?')) deleteCustomer(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingCustomer) {
      await updateCustomer(editingCustomer._id, formData);
    } else {
      await addCustomer(formData);
    }
    setShowModal(false);
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', gstNumber: '', address: '' });
  };

  const openAdd = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', gstNumber: '', address: '' });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Client Directory</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Manage customer accounts, billing details, and outstanding balances</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition self-start sm:self-auto"
        >
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Clients', value: customers.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', Icon: Users },
          { label: 'Outstanding Balance', value: `₹${totalOutstandingBalance.toLocaleString('en-IN')}`, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', Icon: DollarSign },
          { label: 'GST Registered', value: customers.filter(c => c.gstNumber).length, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', Icon: Users },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${s.bg}`}><s.Icon size={20} className={s.color} /></div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className={`text-xl font-extrabold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search clients by name, email or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-16 text-center">
            <Users size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {searchTerm ? 'No clients match your search' : 'No clients added yet'}
            </p>
            {!searchTerm && (
              <button onClick={openAdd} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                Add First Client
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/40 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase">Client</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden sm:table-cell">Contact</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden lg:table-cell">GST No.</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase hidden md:table-cell">Invoices</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase">Outstanding</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredCustomers.map((c, index) => {
                  const balance = getCustomerBalance(c._id);
                  const invCount = getCustomerInvoiceCount(c._id);
                  return (
                    <motion.tr key={c._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md`}>
                            {getInitials(c.name)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 dark:text-white truncate">{c.name}</p>
                            {c.address && <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 truncate"><MapPin size={10} />{c.address}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <div className="space-y-1">
                          {c.email && <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Mail size={11} />{c.email}</p>}
                          {c.phone && <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Phone size={11} />{c.phone}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell font-mono text-xs text-slate-500 dark:text-slate-400">
                        {c.gstNumber || <span className="italic text-slate-300 dark:text-slate-600">No GST</span>}
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <button
                          onClick={() => navigate('/invoices')}
                          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:underline"
                        >
                          {invCount} invoice{invCount !== 1 ? 's' : ''} <ArrowRight size={11} />
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-sm font-bold ${balance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          ₹{balance.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5">
                          <button onClick={() => handleEdit(c)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg text-slate-500 hover:text-blue-600 transition" title="Edit"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(c._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 hover:text-red-600 transition" title="Delete"><Trash2 size={14} /></button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingCustomer ? 'Edit Client' : 'Add New Client'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'e.g. Rajesh Kumar', required: true },
                { label: 'Email Address', key: 'email', type: 'email', placeholder: 'e.g. rajesh@example.com' },
                { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: 'e.g. 9876543210' },
                { label: 'GSTIN Number', key: 'gstNumber', type: 'text', placeholder: 'e.g. 27AAAAA1234A1Z' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">{field.label}</label>
                  <input
                    type={field.type} placeholder={field.placeholder}
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                    required={field.required}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Billing Address</label>
                <textarea rows="3" placeholder="Enter full billing address..."
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20">
                  {editingCustomer ? 'Save Changes' : 'Register Client'}
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

export default Clients;
