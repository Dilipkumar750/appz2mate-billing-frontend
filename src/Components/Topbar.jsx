import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { 
  Menu, Bell, Sun, Moon, Plus, Search, X,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Topbar = ({ pageTitle, darkMode, setDarkMode, onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, getLowStockProducts, invoices } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);

  const lowStockProducts = getLowStockProducts ? getLowStockProducts() : [];
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
  const totalAlerts = lowStockProducts.length + overdueInvoices.length;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getUserInitials = () => {
    if (!user?.name) return 'A';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-4 sm:px-6 py-3.5 shadow-sm">
      
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition flex-shrink-0"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
          Welcome back, {user?.name || 'Admin'}
        </p>
        <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white truncate leading-tight">
          {pageTitle}
        </h1>
      </div>

      {/* Search bar — hidden on small */}
      <div className="hidden md:flex flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search invoices, clients..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 transition"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          title={darkMode ? 'Light Mode' : 'Dark Mode'}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          >
            <Bell size={18} />
            {totalAlerts > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {totalAlerts > 9 ? '9+' : totalAlerts}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 dark:text-white text-sm">Notifications</h3>
                  <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {totalAlerts === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      All clear! No alerts at this time.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                      {lowStockProducts.slice(0, 5).map(p => (
                        <div key={p._id} className="flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => { navigate('/inventory'); setShowNotifications(false); }}>
                          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex-shrink-0">
                            <AlertTriangle size={14} className="text-orange-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">Low Stock: {p.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Only {p.stock} {p.unit} remaining</p>
                          </div>
                        </div>
                      ))}
                      {overdueInvoices.slice(0, 5).map(inv => (
                        <div key={inv._id} className="flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer" onClick={() => { navigate('/invoices'); setShowNotifications(false); }}>
                          <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
                            <AlertTriangle size={14} className="text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">Overdue: {inv.invoiceNumber}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{inv.customerName} — ₹{inv.total?.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* New Invoice button */}
        <button
          onClick={() => navigate('/invoices')}
          className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-md shadow-blue-500/20"
        >
          <Plus size={16} />
          <span>Invoice</span>
        </button>

        {/* User avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer flex-shrink-0 shadow-md shadow-blue-500/20">
          {getUserInitials()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;