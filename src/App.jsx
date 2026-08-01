import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext.jsx';
import Layout from './Components/Layout.jsx';
import Login from './Pages/Login.jsx';

// Lazy load pages
const Dashboard = React.lazy(() => import('./Pages/Dashboard.jsx'));
const Clients = React.lazy(() => import('./Pages/Clients.jsx'));
const Products = React.lazy(() => import('./Pages/Products.jsx'));
const Invoices = React.lazy(() => import('./Pages/Invoices.jsx'));
const Payments = React.lazy(() => import('./Pages/Payments.jsx'));
const Reports = React.lazy(() => import('./Pages/Reports.jsx'));
const Settings = React.lazy(() => import('./Pages/Settings.jsx'));
const Analytics = React.lazy(() => import('./Pages/Analytics.jsx'));
const Expenses = React.lazy(() => import('./Pages/Expenses.jsx'));
const Inventory = React.lazy(() => import('./Pages/Inventory.jsx'));

const AppContent = () => {
  const { isAuthenticated, loading } = useApp();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-semibold">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Authenticating workspace session...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="clients" element={<Clients />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
            success: { duration: 3000, icon: '✅' },
            error: { duration: 4000, icon: '❌' },
          }}
        />
        <React.Suspense fallback={
          <div className="flex h-screen items-center justify-center bg-slate-900 text-white font-semibold">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <AppContent />
        </React.Suspense>
      </AppProvider>
    </BrowserRouter>
  );
};

export default App;