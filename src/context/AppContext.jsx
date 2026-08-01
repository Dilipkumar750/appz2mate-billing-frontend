import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Set production API base URL from env
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [businessType, setBusinessType] = useState('general');
  const [invoiceTemplate, setInvoiceTemplate] = useState('classic');
  const [companySettings, setCompanySettings] = useState({
    name: 'My Business',
    email: 'contact@mybusiness.com',
    phone: '+91 9876543210',
    address: '123 Business Street, City - 400001',
    gstNumber: '27AAAAA1234A1Z',
    panNumber: 'AAAAA1234A',
    logo: null,
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    currency: 'INR'
  });

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
   const [expenses, setExpenses] = useState([]);
  const [inventoryTransactions, setInventoryTransactions] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);

  // Check login on load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await axios.get('/api/auth/profile');
          if (res.data.success) {
            setUser(res.data.user);
            setIsAuthenticated(true);
            await fetchInitialData();
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const fetchInitialData = async () => {
    try {
          const [custRes, prodRes, invRes, payRes, expRes, setRes, transRes, catRes] = await Promise.all([
        axios.get('/api/customers'),
        axios.get('/api/products'),
        axios.get('/api/invoices'),
        axios.get('/api/payments'),
        axios.get('/api/expenses'),
        axios.get('/api/settings'),
        axios.get('/api/inventory'),
        axios.get('/api/categories')
      ]);

      if (custRes.data.success) setCustomers(custRes.data.customers);
      if (prodRes.data.success) setProducts(prodRes.data.products);
      if (invRes.data.success) setInvoices(invRes.data.invoices);
      if (payRes.data.success) setPayments(payRes.data.payments);
      if (expRes.data.success) setExpenses(expRes.data.expenses);
      if (transRes.data.success) setInventoryTransactions(transRes.data.transactions);
      if (catRes.data.success) setCustomCategories(catRes.data.categories);
      
      if (setRes.data.success && setRes.data.settings) {
        setCompanySettings(setRes.data.settings);
        setBusinessType(setRes.data.settings.businessType || 'general');
        setInvoiceTemplate(setRes.data.settings.invoiceTemplate || 'classic');
      }
    } catch (err) {
      console.error('Failed to load startup data:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        });
        setIsAuthenticated(true);
        toast.success('Logged in successfully');
        await fetchInitialData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
        setUser({
          _id: res.data._id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role
        });
        setIsAuthenticated(true);
        toast.success('Account registered!');
        await fetchInitialData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    setCustomers([]);
    setProducts([]);
    setInvoices([]);
    setPayments([]);
    setExpenses([]);
    setInventoryTransactions([]);
    setCustomCategories([]);
    toast.success('Logged out successfully');
  };

  // Sync settings modifications
  const updateCompanySettings = async (updatedSettings) => {
    try {
      const res = await axios.post('/api/settings', updatedSettings);
      if (res.data.success) {
        setCompanySettings(res.data.settings);
        setBusinessType(res.data.settings.businessType || 'general');
        setInvoiceTemplate(res.data.settings.invoiceTemplate || 'classic');
        toast.success('Company settings saved');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update company settings');
    }
  };

  // Customer CRUD API wrappers
  const addCustomer = async (customer) => {
    try {
      const res = await axios.post('/api/customers', customer);
      if (res.data.success) {
        setCustomers([...customers, res.data.customer]);
        toast.success('Customer added');
        return res.data.customer;
      }
    } catch (err) {
      toast.error('Failed to add customer');
    }
  };

  const updateCustomer = async (id, updatedData) => {
    try {
      const res = await axios.put(`/api/customers/${id}`, updatedData);
      if (res.data.success) {
        setCustomers(customers.map(c => c._id === id ? res.data.customer : c));
        toast.success('Customer details updated');
      }
    } catch (err) {
      toast.error('Failed to update customer');
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await axios.delete(`/api/customers/${id}`);
      if (res.data.success) {
        setCustomers(customers.filter(c => c._id !== id));
        toast.success('Customer deleted');
      }
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  // Product CRUD API wrappers
  const addProduct = async (product) => {
    try {
      const res = await axios.post('/api/products', { ...product, businessType });
      if (res.data.success) {
        setProducts([...products, res.data.product]);
        toast.success('Product catalog updated');
        return res.data.product;
      }
    } catch (err) {
      toast.error('Failed to add product');
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const res = await axios.put(`/api/products/${id}`, updatedData);
      if (res.data.success) {
        setProducts(products.map(p => p._id === id ? res.data.product : p));
        toast.success('Product info saved');
      }
    } catch (err) {
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await axios.delete(`/api/products/${id}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== id));
        toast.success('Product deleted');
      }
    } catch (err) {
      toast.error('Failed to remove product');
    }
  };

  // Inventory Stock Adjustments
  const updateStock = async (productId, quantity, type) => {
    try {
      const res = await axios.post('/api/inventory', { productId, quantity, type });
      if (res.data.success) {
        // Update product stock locally
        setProducts(products.map(p => p._id === productId ? res.data.product : p));
        setInventoryTransactions([res.data.transaction, ...inventoryTransactions]);
        
        const pName = res.data.product.name;
        const pStock = res.data.product.stock;
        
        if (pStock <= res.data.product.lowStock && res.data.product.lowStock > 0) {
          toast.warning(`Low stock alert: ${pName} has ${pStock} remaining!`);
        }
        
        toast.success(`Stock level ${type === 'add' ? 'replenished' : 'adjusted'}`);
        return true;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
      return false;
    }
  };

  const getLowStockProducts = () => {
    return products.filter(p => p.stock <= p.lowStock && p.lowStock > 0);
  };

  // Invoice Generation
  const createInvoice = async (invoiceData) => {
    try {
      const res = await axios.post('/api/invoices', {
        ...invoiceData,
        businessType,
        template: invoiceData.template || invoiceTemplate
      });

      if (res.data.success) {
        setInvoices([res.data.invoice, ...invoices]);
        
        // Refresh products and inventory transactions since stock levels auto-updated on backend
        const [prodRes, transRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/inventory')
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (transRes.data.success) setInventoryTransactions(transRes.data.transactions);

        toast.success(`Invoice ${res.data.invoice.invoiceNumber} generated`);
        return res.data.invoice;
      }
    } catch (err) {
      toast.error('Failed to create invoice');
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      const res = await axios.put(`/api/invoices/${id}/status`, { status });
      if (res.data.success) {
        setInvoices(invoices.map(i => i._id === id ? res.data.invoice : i));
        toast.success(`Invoice marked as ${status}`);
      }
    } catch (err) {
      toast.error('Failed to update invoice status');
    }
  };

  // Payment Recording
  const recordPayment = async (paymentData) => {
    try {
      const res = await axios.post('/api/payments', paymentData);
      if (res.data.success) {
        setPayments([res.data.payment, ...payments]);
        
        // Refresh invoices locally to reflect any auto Paid status
        const invRes = await axios.get('/api/invoices');
        if (invRes.data.success) setInvoices(invRes.data.invoices);
        
        toast.success('Payment transaction recorded');
      }
    } catch (err) {
      console.error("Payment Record Error:", err);
      toast.error(err.response?.data?.message || err.message || 'Failed to record payment');
    }
  };

  // Expense CRUD
  const addExpense = async (expense) => {
    try {
      const res = await axios.post('/api/expenses', expense);
      if (res.data.success) {
        setExpenses([res.data.expense, ...expenses]);
        toast.success('Expense logged');
        return res.data.expense;
      }
    } catch (err) {
      toast.error('Failed to log expense');
    }
  };

  const updateExpense = async (id, updatedData) => {
    try {
      const res = await axios.put(`/api/expenses/${id}`, updatedData);
      if (res.data.success) {
        setExpenses(expenses.map(e => e._id === id ? res.data.expense : e));
        toast.success('Expense details updated');
      }
    } catch (err) {
      toast.error('Failed to update expense');
    }
  };

  const deleteExpense = async (id) => {
    try {
      const res = await axios.delete(`/api/expenses/${id}`);
      if (res.data.success) {
        setExpenses(expenses.filter(e => e._id !== id));
        toast.success('Expense log entry deleted');
      }
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  // Custom Category builder CRUD API
  const addCustomCategory = async (name, fields) => {
    try {
      const res = await axios.post('/api/categories', { name, fields });
      if (res.data.success) {
        setCustomCategories([...customCategories, res.data.category]);
        toast.success('Custom Category created');
        return res.data.category;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create category');
    }
  };

  const deleteCustomCategory = async (id) => {
    try {
      const res = await axios.delete(`/api/categories/${id}`);
      if (res.data.success) {
        setCustomCategories(customCategories.filter(c => c._id !== id));
        toast.success('Custom Category deleted');
      }
    } catch (err) {
      toast.error('Failed to delete custom category');
    }
  };

  // Get statistics
  const getStats = () => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);
    const pendingAmount = invoices.filter(i => i.status === 'Pending').reduce((sum, i) => sum + i.total, 0);
    const totalCustomers = customers.length;
    const totalProducts = products.length;
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    const monthlyRevenue = invoices
      .filter(i => i.status === 'Paid' && new Date(i.date).getMonth() === new Date().getMonth())
      .reduce((sum, i) => sum + i.total, 0);
    
    const monthlyExpenses = expenses
      .filter(e => new Date(e.date).getMonth() === new Date().getMonth())
      .reduce((sum, e) => sum + e.amount, 0);

    return { 
      totalInvoices, 
      totalRevenue, 
      pendingAmount, 
      totalCustomers, 
      totalProducts,
      totalExpenses,
      netProfit,
      monthlyRevenue,
      monthlyExpenses
    };
  };

  // Analytics Data
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthRevenue = invoices
        .filter(i => i.status === 'Paid' && new Date(i.date).getMonth() === index && new Date(i.date).getFullYear() === currentYear)
        .reduce((sum, i) => sum + i.total, 0);
      
      const monthExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === index && new Date(e.date).getFullYear() === currentYear)
        .reduce((sum, e) => sum + e.amount, 0);
      
      return { month, revenue: monthRevenue, expenses: monthExpenses, profit: monthRevenue - monthExpenses };
    });
  };

  const getCategorySales = () => {
    const categoryMap = new Map();
    products.forEach(product => {
      const salesCount = invoices.flatMap(i => i.items).filter(item => item.productId === product._id).length;
      if (categoryMap.has(product.category)) {
        categoryMap.set(product.category, categoryMap.get(product.category) + salesCount);
      } else {
        categoryMap.set(product.category, salesCount);
      }
    });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })).filter(c => c.value > 0);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated, user, loading, login, register, logout: handleLogout,
      businessType, setBusinessType,
      invoiceTemplate, setInvoiceTemplate,
      companySettings, updateCompanySettings,
      customers, addCustomer, updateCustomer, deleteCustomer,
      products, addProduct, updateProduct, deleteProduct,
      invoices, createInvoice, updateInvoiceStatus,
      payments, recordPayment,
      expenses, addExpense, updateExpense, deleteExpense,
      customCategories, addCustomCategory, deleteCustomCategory,
      inventoryTransactions, updateStock, getLowStockProducts,
      getStats, getMonthlyData, getCategorySales
    }}>
      {children}
    </AppContext.Provider>
  );
};