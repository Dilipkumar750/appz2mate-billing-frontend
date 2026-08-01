import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, DollarSign, Package, Users,
  Download, BarChart3, Activity
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#6366F1'];

const Analytics = () => {
  const { getMonthlyData, getCategorySales, invoices, expenses, products, getStats, payments } = useApp();
  const [timeRange, setTimeRange] = useState('year');

  const stats = useMemo(() => getStats(), [invoices, expenses, products]);
  const monthlyData = useMemo(() => getMonthlyData(), [invoices, expenses]);
  const categoryData = useMemo(() => getCategorySales(), [invoices, products]);

  // Growth metrics
  const currentMonthRevenue = monthlyData[new Date().getMonth()]?.revenue || 0;
  const previousMonthRevenue = monthlyData[Math.max(0, new Date().getMonth() - 1)]?.revenue || 0;
  const revenueGrowth = previousMonthRevenue
    ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1)
    : currentMonthRevenue > 0 ? 100 : 0;

  // BUG FIX: use product._id instead of product.id
  const topProducts = useMemo(() => {
    return products
      .map(product => {
        const salesCount = invoices.flatMap(i => i.items || [])
          .filter(item => item.productId === product._id).length;
        const revenue = invoices.flatMap(i => i.items || [])
          .filter(item => item.productId === product._id)
          .reduce((sum, item) => sum + (item.total || 0), 0);
        return { ...product, salesCount, revenue };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [products, invoices]);

  // Real payment methods from actual payment records (not hardcoded)
  const paymentMethodData = useMemo(() => {
    const methodMap = {};
    payments.forEach(p => {
      const method = p.paymentMethod || 'Other';
      methodMap[method] = (methodMap[method] || 0) + p.amount;
    });
    const total = Object.values(methodMap).reduce((s, v) => s + v, 0);
    return Object.entries(methodMap).map(([name, value], i) => ({
      name,
      value: total > 0 ? Math.round((value / total) * 100) : 0,
      amount: value,
      color: COLORS[i % COLORS.length]
    })).filter(m => m.value > 0);
  }, [payments]);

  // Real customer data: new vs returning
  const customerRetentionData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), monthIndex: d.getMonth() };
    });
    const seenCustomers = new Set();
    return months.map(m => {
      const monthInvoices = invoices.filter(inv => {
        const d = new Date(inv.date);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      });
      let newCount = 0, returningCount = 0;
      monthInvoices.forEach(inv => {
        if (inv.customerId) {
          if (seenCustomers.has(inv.customerId)) { returningCount++; }
          else { newCount++; seenCustomers.add(inv.customerId); }
        } else { newCount++; }
      });
      return { month: m.month, new: newCount, returning: returningCount };
    });
  }, [invoices]);

  const profitMargin = stats.totalRevenue > 0
    ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)
    : 0;

  const avgOrderValue = stats.totalInvoices > 0
    ? (stats.totalRevenue / stats.totalInvoices).toFixed(0)
    : 0;

  const clv = stats.totalCustomers > 0
    ? (stats.totalRevenue / stats.totalCustomers).toFixed(0)
    : 0;

  const metricsCards = [
    {
      title: 'Revenue Growth', value: `${revenueGrowth}%`,
      change: revenueGrowth > 0 ? 'Up from last month' : 'Down from last month',
      icon: TrendingUp, color: Number(revenueGrowth) >= 0 ? 'text-emerald-600' : 'text-red-500',
      bgColor: Number(revenueGrowth) >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'
    },
    {
      title: 'Profit Margin', value: `${profitMargin}%`,
      change: 'Net profit ratio', icon: DollarSign, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Avg Order Value', value: `₹${Number(avgOrderValue).toLocaleString('en-IN')}`,
      change: 'Per transaction', icon: Activity, color: 'text-violet-600', bgColor: 'bg-violet-100 dark:bg-violet-900/30'
    },
    {
      title: 'Customer LTV', value: `₹${Number(clv).toLocaleString('en-IN')}`,
      change: 'Average per client', icon: Users, color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
  ];

  const exportAnalyticsCsv = () => {
    const header = 'Month,Revenue,Expenses,Net Profit\r\n';
    const rows = monthlyData.map(d => `${d.month},${d.revenue},${d.expenses},${d.profit}`).join('\r\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + header + rows;
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `analytics_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Deep insights into your business performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 dark:text-slate-200 text-sm focus:outline-none"
          >
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={exportAnalyticsCsv}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsCards.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm card-hover"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider">{metric.title}</p>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">{metric.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{metric.change}</p>
                </div>
                <div className={`p-3 rounded-xl flex-shrink-0 ${metric.bgColor}`}>
                  <Icon className={metric.color} size={22} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue & Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">Revenue vs Expenses Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly breakdown for {new Date().getFullYear()}</p>
            </div>
            <BarChart3 size={18} className="text-slate-400" />
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthlyData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }}
                formatter={v => [`₹${v.toLocaleString('en-IN')}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fill="url(#revGrad)" name="Revenue" dot={false} />
              <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="url(#expGrad)" name="Expenses" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData.length ? categoryData : [{ name: 'No Data', value: 1 }]}
                cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value"
              >
                {(categoryData.length ? categoryData : [{ name: 'No Data', value: 1 }]).map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Top Performing Products</h3>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No sales data available yet</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-extrabold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white text-sm truncate">{product.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{product.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-slate-900 dark:text-white text-sm">₹{product.revenue.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500">{product.salesCount} sales</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods - Real Data */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Payment Methods Distribution</h3>
          {paymentMethodData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethodData} cx="50%" cy="50%" outerRadius={65} dataKey="value">
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n, p) => [`${v}% (₹${p.payload.amount?.toLocaleString('en-IN')})`, n]} contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {paymentMethodData.map(method => (
                  <div key={method.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: method.color }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{method.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white">{method.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No payment records yet</div>
          )}
        </div>
      </div>

      {/* Customer Retention */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white">Customer Acquisition &amp; Retention</h3>
            <p className="text-xs text-slate-400 mt-0.5">New vs returning customers per month</p>
          </div>
          <Users size={18} className="text-slate-400" />
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={customerRetentionData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="new" fill="#3B82F6" name="New Customers" radius={[4, 4, 0, 0]} />
            <Bar dataKey="returning" fill="#10B981" name="Returning Customers" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Key Insight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/25">
          <p className="text-sm font-medium opacity-80">Revenue Insight</p>
          <p className="text-3xl font-extrabold mt-2">{revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}%</p>
          <p className="text-sm mt-2 opacity-80">
            {Number(revenueGrowth) >= 0 ? 'Growth compared to last month' : 'Decrease compared to last month'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25">
          <p className="text-sm font-medium opacity-80">Net Profitability</p>
          <p className="text-3xl font-extrabold mt-2">₹{stats.netProfit.toLocaleString('en-IN')}</p>
          <p className="text-sm mt-2 opacity-80">Net profit after all expenses</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl p-5 text-white shadow-lg shadow-violet-500/25">
          <p className="text-sm font-medium opacity-80">Margin Score</p>
          <p className="text-3xl font-extrabold mt-2">{profitMargin}%</p>
          <p className="text-sm mt-2 opacity-80">Profit margin on total revenue</p>
        </div>
      </div>
    </div>
  );
};

export default Analytics;