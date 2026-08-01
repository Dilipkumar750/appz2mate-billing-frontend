import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Activity, IndianRupee, PieChart as PieChartIcon } from 'lucide-react';

const Dashboard = () => {
  const { invoices, payments, expenses } = useApp();

  // 1. Calculate Monthly Revenue vs Expenses (Last 6 Months)
  const monthlyData = useMemo(() => {
    const dataMap = {};
    const today = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      dataMap[monthStr] = { name: monthStr, Revenue: 0, Expenses: 0 };
    }

    // Aggregate Payments (Revenue)
    payments.forEach(p => {
      const d = new Date(p.date || p.createdAt);
      const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (dataMap[monthStr]) dataMap[monthStr].Revenue += p.amount;
    });

    // Aggregate Expenses
    expenses.forEach(e => {
      const d = new Date(e.date || e.createdAt);
      const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (dataMap[monthStr]) dataMap[monthStr].Expenses += e.amount;
    });

    return Object.values(dataMap);
  }, [payments, expenses]);

  // 2. Calculate Payment Method Breakdown
  const paymentMethodData = useMemo(() => {
    const methods = {};
    payments.forEach(p => {
      methods[p.paymentMethod] = (methods[p.paymentMethod] || 0) + p.amount;
    });
    return Object.keys(methods).map(key => ({ name: key, value: methods[key] }));
  }, [payments]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  // Summary Metrics
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <div className="space-y-6 pb-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Business Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Analytics, trends, and financial breakdown</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Revenue</p>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl"><IndianRupee size={24} /></div>
        </motion.div>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Expenses</p>
            <p className="text-2xl font-black text-rose-500 dark:text-rose-400 mt-2">₹{totalExpenses.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 rounded-2xl"><TrendingUp size={24} /></div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Billed Amount</p>
            <p className="text-2xl font-black text-emerald-500 dark:text-emerald-400 mt-2">₹{totalInvoiced.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400 rounded-2xl"><Activity size={24} /></div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm p-6">
          <div className="mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Activity className="text-blue-500" size={18} />
            <h3 className="font-bold text-sm uppercase tracking-widest text-[11px]">Revenue vs Expenses (6 Months)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl shadow-sm p-6">
          <div className="mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <PieChartIcon className="text-purple-500" size={18} />
            <h3 className="font-bold text-sm uppercase tracking-widest text-[11px]">Payment Methods</h3>
          </div>
          {paymentMethodData.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex items-center justify-center text-slate-400 text-sm">
              No payment data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;