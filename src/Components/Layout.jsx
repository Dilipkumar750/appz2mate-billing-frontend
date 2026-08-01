import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close sidebar on larger screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.slice(1);
    if (!path || path === 'dashboard') return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">

        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="sidebar-overlay lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        <div
          className={`flex-1 flex flex-col transition-all duration-300 min-w-0
            ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}
            ml-0
          `}
        >
          <Topbar
            pageTitle={getPageTitle()}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onMenuToggle={() => setMobileOpen(true)}
          />
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;