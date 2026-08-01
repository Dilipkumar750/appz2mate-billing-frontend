import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, FileText, Calendar, DollarSign, Wallet, TrendingUp } from 'lucide-react';

const Reports = () => {
  const { getMonthlyData, expenses, getStats, invoices } = useApp();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 5);
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const monthlyData = useMemo(() => getMonthlyData(), [invoices, expenses]);
  const stats = useMemo(() => getStats(), [invoices, expenses]);

  // Filter invoices & expenses based on selected dates
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const d = inv.date ? inv.date.split('T')[0] : '';
      return d >= startDate && d <= endDate;
    });
  }, [invoices, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const d = exp.date ? exp.date.split('T')[0] : '';
      return d >= startDate && d <= endDate;
    });
  }, [expenses, startDate, endDate]);

  // Calculations for selected period
  const periodRevenue = useMemo(() => 
    filteredInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.total || 0), 0)
  , [filteredInvoices]);

  const periodGSTCollected = useMemo(() => 
    filteredInvoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + (i.gstTotal || 0), 0)
  , [filteredInvoices]);

  const periodExpenses = useMemo(() => 
    filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0)
  , [filteredExpenses]);

  const periodProfit = periodRevenue - periodExpenses;

  const expenseCategories = ['Rent', 'Salaries', 'Utilities', 'Transport', 'Food & Dining', 'Supplies', 'Marketing', 'Other'];
  
  const categoryExpenses = useMemo(() => {
    return expenseCategories.map(cat => {
      const total = filteredExpenses
        .filter(e => e.category === cat)
        .reduce((sum, e) => sum + e.amount, 0);
      return { name: cat, amount: total };
    }).filter(item => item.amount > 0);
  }, [filteredExpenses]);

  const performanceScore = periodRevenue > 0 
    ? Math.min(100, Math.max(0, Math.round((periodProfit / periodRevenue) * 100))) 
    : 0;

  const downloadReportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Month,Revenue,Expenses,Net Profit\r\n';
    monthlyData.forEach(row => {
      csvContent += `${row.month},${row.revenue},${row.expenses},${row.profit}\r\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Deep dive analysis of income generation, tax collected, and overall margins</p>
        </div>
        <button 
          onClick={downloadReportCsv}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/25 self-start sm:self-auto font-sans"
        >
          <Download size={15} />
          <span>Export curves (CSV)</span>
        </button>
      </div>

      {/* Date Pickers */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider self-start sm:self-auto">Filter Period:</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Revenue in Period', value: `₹${periodRevenue.toLocaleString('en-IN')}`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', Icon: DollarSign },
          { label: 'Expenses in Period', value: `₹${periodExpenses.toLocaleString('en-IN')}`, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', Icon: Wallet },
          { label: 'Net Margin', value: `₹${periodProfit.toLocaleString('en-IN')}`, color: periodProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400', bg: periodProfit >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20', Icon: TrendingUp },
          { label: 'GST Collected', value: `₹${periodGSTCollected.toLocaleString('en-IN')}`, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20', Icon: FileText },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
              <p className="text-lg font-extrabold mt-1 text-slate-900 dark:text-white">{s.value}</p>
            </div>
            <div className={`p-2 rounded-xl ${s.bg}`}>
              <s.Icon size={18} className={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Curves & Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revenue &amp; Profit curves</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly breakdown of billed sales vs operational expenses</p>
            </div>
            <span className="rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              LEDGER TIMELINE
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" name="Revenue" dot={false} />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#profitGrad)" name="Net Profit" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category & Margin Score */}
        <div className="space-y-6">
          {/* Expenses categories distribution */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Expenses in Period</h3>
            <div className="h-44 w-full">
              {categoryExpenses.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryExpenses} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 11 }} formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                    <Bar dataKey="amount" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-700/20">
                  No logged expenses to graph
                </div>
              )}
            </div>
          </div>

          {/* Performance scorecard */}
          <div className="rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Margin Efficiency Score</h3>
            <p className="mt-1 text-xs text-slate-400">Net margin efficiency calculated relative to revenue and costs for this period</p>
            <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
              <div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{performanceScore}%</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Efficiency Score</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                performanceScore > 50 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                performanceScore > 20 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
              }`}>
                {performanceScore > 50 ? 'Healthy Margin' : performanceScore > 20 ? 'Average Margin' : 'Action Required'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
