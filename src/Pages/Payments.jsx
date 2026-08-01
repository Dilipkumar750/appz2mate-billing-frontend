import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { Plus, CheckCircle, Clock, CreditCard, X, Search, Calendar } from 'lucide-react';

const Payments = () => {
  const { payments, recordPayment, invoices } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    paymentMethod: 'UPI'
  });

  const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchSearch = p.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
      return matchSearch && matchMethod;
    });
  }, [payments, searchTerm, methodFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedInvoice = invoices.find(inv => inv._id === formData.invoiceId);
    
    if (selectedInvoice) {
      await recordPayment({
        invoiceId: selectedInvoice._id,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerName: selectedInvoice.customerName,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod
      });
      setShowModal(false);
      setFormData({ invoiceId: '', amount: '', paymentMethod: 'UPI' });
    }
  };

  const handleInvoiceChange = (e) => {
    const invId = e.target.value;
    const inv = invoices.find(i => i._id === invId);
    setFormData({
      ...formData,
      invoiceId: invId,
      amount: inv ? inv.total.toString() : ''
    });
  };

  // Calculate metrics
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  const pendingPayouts = invoices
    .filter(inv => inv.status === 'Pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  const methodColors = {
    UPI: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
    Cash: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    'Bank Transfer': 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    'Credit Card': 'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-800',
    Cheque: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Payments Ledger</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Track and record income collections, payment methods, and processing history</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition self-start sm:self-auto font-sans"
        >
          <Plus size={16} />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm flex items-center justify-between card-hover">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Collected Revenue</p>
            <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalReceived.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm flex items-center justify-between card-hover">
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Pending Receivables</p>
            <p className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">₹{pendingPayouts.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search payments by client or invoice number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-sm cursor-pointer focus:outline-none"
        >
          <option value="all">All Methods</option>
          <option value="UPI">UPI</option>
          <option value="Cash">Cash</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Credit Card">Credit Card</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>

      {/* Table list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-16 text-center">
            <CreditCard size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No payments logged</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Record a new payment from a pending invoice to start</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Invoice No</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Customer Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Amount Paid</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Payment Method</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Received Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPayments.map((p, index) => (
                  <motion.tr
                    key={p._id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{p.invoiceNumber}</td>
                    <td className="px-5 py-4 font-semibold text-slate-700 dark:text-slate-200">{p.customerName}</td>
                    <td className="px-5 py-4 font-black text-slate-900 dark:text-white">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold border ${methodColors[p.paymentMethod] || methodColors.Cheque}`}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800">
                        {p.status || 'Received'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>{new Date(p.date || p.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CreditCard size={20} className="text-blue-600"/>
                <span>Record Invoice Payment</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Select Pending Invoice</label>
                <select
                  value={formData.invoiceId}
                  onChange={handleInvoiceChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                  required
                >
                  <option value="">-- Choose Pending Bill --</option>
                  {pendingInvoices.map(inv => (
                    <option key={inv._id} value={inv._id}>
                      {inv.invoiceNumber} - {inv.customerName} (₹{inv.total.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Amount Collected (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none focus:border-blue-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                  required
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-white text-sm font-semibold transition shadow-lg shadow-blue-500/20">
                  Log Payment
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

export default Payments;
