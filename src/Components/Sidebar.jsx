import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext.jsx';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Building2,
  LogOut,
  X
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { path: '/analytics', name: 'Analytics', icon: TrendingUp, color: 'text-violet-500' },
  { path: '/clients', name: 'Clients', icon: Users, color: 'text-emerald-500' },
  { path: '/products', name: 'Products', icon: Package, color: 'text-orange-500' },
  { path: '/inventory', name: 'Inventory', icon: ShoppingCart, color: 'text-cyan-500' },
  { path: '/invoices', name: 'Invoices', icon: FileText, color: 'text-blue-500' },
  { path: '/payments', name: 'Payments', icon: CreditCard, color: 'text-green-500' },
  { path: '/expenses', name: 'Expenses', icon: DollarSign, color: 'text-red-500' },
  { path: '/reports', name: 'Reports', icon: BarChart3, color: 'text-amber-500' },
  { path: '/settings', name: 'Settings', icon: Settings, color: 'text-slate-500' },
];

const Sidebar = ({ collapsed, setCollapsed, darkMode, setDarkMode, mobileOpen, setMobileOpen }) => {
  const { logout, getLowStockProducts } = useApp();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const lowStockCount = getLowStockProducts ? getLowStockProducts().length : 0;

  const SidebarContent = () => {
    const { companySettings } = useApp();
    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center border-b border-slate-100 dark:border-slate-700/50 p-4 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-xl border border-slate-100 dark:border-slate-700 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {companySettings?.logo ? (
                <img src={companySettings.logo} alt="Company Logo" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Building2 size={16} className="text-white" />
                </div>
              )}
            </div>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none">APPZ2MATE</p>
                <p className="text-sm font-black text-slate-800 dark:text-white leading-tight mt-0.5">Billing Pro</p>
              </motion.div>
            )}
          </div>
        {/* Close on mobile */}
        {mobileOpen && !collapsed && (
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
          >
            <X size={18} />
          </button>
        )}
        {/* Collapse on desktop */}
        {!mobileOpen && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition ${collapsed ? 'mx-auto' : ''}`}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-800 dark:hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-900/20"
                      transition={{ type: 'spring', duration: 0.4 }}
                    />
                  )}
                  <div className={`relative flex-shrink-0 ${isActive ? item.color : ''}`}>
                    <Icon size={19} />
                    {item.path === '/inventory' && lowStockCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                        {lowStockCount > 9 ? '9' : lowStockCount}
                      </span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="relative text-sm font-medium">{item.name}</span>
                  )}
                  {/* Tooltip when collapsed */}
                  {collapsed && hoveredItem === item.path && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg pointer-events-none">
                      {item.name}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700/50 space-y-1">
        {/* Dark mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          onMouseEnter={() => setHoveredItem('darkmode')}
          onMouseLeave={() => setHoveredItem(null)}
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-slate-100 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400 transition ${collapsed ? 'justify-center' : ''}`}
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          {!collapsed && <span className="text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          {collapsed && hoveredItem === 'darkmode' && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </div>
          )}
        </button>

        {/* Logout — always visible, icon only when collapsed */}
        <button
          onClick={logout}
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl w-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 dark:text-red-400 transition cursor-pointer ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={19} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
          {collapsed && hoveredItem === 'logout' && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-red-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50 shadow-sm z-30 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="lg:hidden fixed left-0 top-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50 shadow-xl z-30 flex flex-col"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;