import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { 
  Plus, Search, Download, Eye, FileText, CheckCircle, Clock, XCircle, 
  AlertCircle, ArrowLeft, Trash2, CreditCard, Layers, Tag, User, 
  Sparkles, ListPlus, CircleDollarSign, Landmark
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import InvoiceDetailModal, { InvoiceTemplateRenderer } from '../Components/InvoiceDetailModal.jsx';

const Invoices = () => {
  const { 
    invoices, createInvoice, updateInvoiceStatus, companySettings, 
    customers, products, customCategories 
  } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Stats memo
  const stats = useMemo(() => {
    const total = invoices.length;
    const paid = invoices.filter(i => i.status === 'Paid').length;
    const pending = invoices.filter(i => i.status === 'Pending').length;
    const overdue = invoices.filter(i => i.status === 'Overdue').length;
    const totalAmount = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    return { total, paid, pending, overdue, totalAmount };
  }, [invoices]);

  // Billing Desk State
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [walkInName, setWalkInName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [billingItems, setBillingItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(companySettings?.businessType || 'general');
  const [selectedTemplate, setSelectedTemplate] = useState(companySettings?.invoiceTemplate || 'classic');
  const [extraFields, setExtraFields] = useState({
    doctorName: '', patientName: '', patientPhone: '', rxNumber: '',
    tableNumber: '', waiterName: '', paxCount: '1',
    vehicleNumber: '', vehicleModel: '', odometerReading: '', advisorName: '',
    propertyAddress: '', tenantName: '', leasePeriod: '', securityDeposit: '0',
    studentName: '', rollNumber: '', classBatch: '', academicTerm: '',
    stylistName: '', membershipId: '',
    challanNumber: '', truckNumber: '', supervisorName: '', loadingCharges: '0'
  });

  // Autocomplete / Search products states
  const [productQuery, setProductQuery] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [billingQty, setBillingQty] = useState(1);

  // Manual Custom Line Item states
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');
  const [customItemGst, setCustomItemGst] = useState('18');
  const [customItemUnit, setCustomItemUnit] = useState('piece');

  useEffect(() => {
    if (companySettings) {
      setActiveCategory(companySettings.businessType || 'general');
      setSelectedTemplate(companySettings.invoiceTemplate || 'classic');
    }
  }, [companySettings]);

  const handleExtraFieldChange = (key, value) => {
    setExtraFields(prev => ({ ...prev, [key]: value }));
  };

  // Filtered product suggestions
  const productSuggestions = useMemo(() => {
    if (!productQuery) return [];
    return products.filter(p => 
      p.name?.toLowerCase().includes(productQuery.toLowerCase()) || 
      p.hsn?.includes(productQuery)
    );
  }, [products, productQuery]);

  const selectProductSuggestion = (product) => {
    const existingIndex = billingItems.findIndex(item => item._id === product._id);
    if (existingIndex > -1) {
      const updated = [...billingItems];
      updated[existingIndex].quantity += billingQty;
      updated[existingIndex].total = updated[existingIndex].price * updated[existingIndex].quantity * (1 + updated[existingIndex].gst / 100);
      setBillingItems(updated);
    } else {
      const itemTotal = product.price * billingQty * (1 + product.gst / 100);
      setBillingItems([...billingItems, {
        ...product,
        quantity: billingQty,
        total: itemTotal
      }]);
    }
    setProductQuery('');
    setBillingQty(1);
    setShowProductSuggestions(false);
  };

  const addCustomItem = () => {
    if (!customItemName || !customItemPrice) return;
    const price = parseFloat(customItemPrice) || 0;
    const gst = parseFloat(customItemGst) || 0;
    const itemTotal = price * billingQty * (1 + gst / 100);

    setBillingItems([...billingItems, {
      _id: 'custom-' + Date.now(),
      name: customItemName,
      price,
      gst,
      unit: customItemUnit,
      quantity: billingQty,
      total: itemTotal,
      hsn: ''
    }]);

    setCustomItemName('');
    setCustomItemPrice('');
    setBillingQty(1);
  };

  const removeBillingItem = (index) => {
    setBillingItems(billingItems.filter((_, i) => i !== index));
  };

  const updateItemQty = (index, delta) => {
    const updated = [...billingItems];
    const newQty = Math.max(1, updated[index].quantity + delta);
    updated[index].quantity = newQty;
    updated[index].total = updated[index].price * newQty * (1 + updated[index].gst / 100);
    setBillingItems(updated);
  };

  const calculateSubtotal = () => {
    return billingItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateGstTotal = () => {
    return billingItems.reduce((sum, item) => sum + (item.price * item.quantity * item.gst / 100), 0);
  };

  const calculateGrandTotal = () => {
    const baseTotal = billingItems.reduce((sum, item) => sum + item.total, 0);
    if (activeCategory === 'construction' && extraFields.loadingCharges) {
      return baseTotal + parseFloat(extraFields.loadingCharges || '0');
    }
    return baseTotal;
  };

  const isCustomCategory = !['general', 'medical', 'department', 'it', 'restaurant', 'automobile', 'realestate', 'education', 'salon', 'construction'].includes(activeCategory);
  
  const livePreviewInvoice = useMemo(() => {
    const customer = customers.find(c => c._id === selectedCustomer);
    return {
      invoiceNumber: 'INV-DRAFT',
      date: new Date().toISOString(),
      status: 'Pending',
      customerName: customer?.name || 'Walk-in Customer',
      customerPhone: customerPhone || customer?.phone || '',
      customerEmail: customerEmail || customer?.email || '',
      customerAddress: customerAddress || customer?.address || '',
      customerGST: customer?.gstNumber || '',
      businessType: activeCategory,
      template: selectedTemplate,
      extraFields: extraFields,
      items: billingItems,
      subtotal: calculateSubtotal(),
      gstTotal: calculateGstTotal(),
      total: calculateGrandTotal()
    };
  }, [customers, selectedCustomer, activeCategory, selectedTemplate, extraFields, billingItems, customerPhone, customerEmail, customerAddress]);
  
  const getSelectedCustomCategory = () => {
    return customCategories.find(cat => cat.name.toLowerCase().replace(/\s+/g, '_') === activeCategory);
  };

  const handleGenerateInvoice = async (status = 'Pending') => {
    const customer = customers.find(c => c._id === selectedCustomer);
    const relevantExtraFields = {};

    if (isCustomCategory) {
      const cat = getSelectedCustomCategory();
      if (cat) {
        cat.fields.forEach(f => {
          relevantExtraFields[f.key] = extraFields[f.key] || '';
        });
      }
    } else {
      const keysMap = {
        medical: ['doctorName', 'patientName', 'patientPhone', 'rxNumber'],
        restaurant: ['tableNumber', 'waiterName', 'paxCount'],
        automobile: ['vehicleNumber', 'vehicleModel', 'odometerReading', 'advisorName'],
        realestate: ['propertyAddress', 'tenantName', 'leasePeriod', 'securityDeposit'],
        education: ['studentName', 'rollNumber', 'classBatch', 'academicTerm'],
        salon: ['stylistName', 'membershipId'],
        construction: ['challanNumber', 'truckNumber', 'supervisorName', 'loadingCharges']
      };

      const keys = keysMap[activeCategory] || [];
      keys.forEach(key => {
        relevantExtraFields[key] = extraFields[key];
      });
    }

    const invoiceData = {
      customerId: selectedCustomer,
      customerName: customer?.name || 'Walk-in Customer',
      customerPhone: customerPhone || customer?.phone || '',
      customerEmail: customerEmail || customer?.email || '',
      customerAddress: customerAddress || customer?.address || '',
      customerGST: customer?.gstNumber || '',
      template: selectedTemplate,
      extraFields: relevantExtraFields,
      businessType: activeCategory,
      status,
      items: billingItems.map(item => ({
        productId: item._id.startsWith('custom') ? null : item._id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        gst: item.gst,
        hsn: item.hsn || '',
        subtotal: item.price * item.quantity,
        gstAmount: (item.price * item.quantity) * (item.gst / 100),
        total: item.total,
        unit: item.unit
      })),
      subtotal: calculateSubtotal(),
      gstTotal: calculateGstTotal(),
      total: calculateGrandTotal()
    };

    await createInvoice(invoiceData);
    setIsCreating(false);
    resetBillingDesk();
  };

  const resetBillingDesk = () => {
    setSelectedCustomer('');
    setCustomerPhone('');
    setCustomerEmail('');
    setCustomerAddress('');
    setBillingItems([]);
    setProductQuery('');
    setCustomItemName('');
    setCustomItemPrice('');
    setExtraFields({
      doctorName: '', patientName: '', patientPhone: '', rxNumber: '',
      tableNumber: '', waiterName: '', paxCount: '1',
      vehicleNumber: '', vehicleModel: '', odometerReading: '', advisorName: '',
      propertyAddress: '', tenantName: '', leasePeriod: '', securityDeposit: '0',
      studentName: '', rollNumber: '', classBatch: '', academicTerm: '',
      stylistName: '', membershipId: '',
      challanNumber: '', truckNumber: '', supervisorName: '', loadingCharges: '0'
    });
  };

  // PDF Generator helper
  const downloadPDF = (invoice) => {
    const doc = new jsPDF();
    const titleMap = {
      classic: 'TAX INVOICE',
      modern: 'BUSINESS INVOICE',
      minimal: 'INVOICE',
      medical: 'PHARMA INVOICE',
      service: 'SERVICE INVOICE',
      retail: 'RETAIL INVOICE',
      restaurant: 'RESTAURANT BILL',
      automobile: 'GARAGE JOB CARD & BILL',
      realestate: 'LEASE INVOICE',
      education: 'FEES RECEIPT',
      salon: 'SALON & SPA BILL',
      construction: 'HARDWARE & BULK INVOICE'
    };
    
    const invoiceTitle = titleMap[invoice.template] || 'TAX INVOICE';
    const isModern = invoice.template === 'modern';
    const biz = companySettings || {
      name: 'My Business',
      email: 'contact@mybusiness.com',
      phone: '+91 9876543210',
      address: '123 Business Street, City - 400001',
      gstNumber: '27AAAAA1234A1Z'
    };

    // Header
    doc.setFontSize(18);
    if (isModern) {
      doc.setTextColor(59, 130, 246);
    }
    doc.text(invoiceTitle, 105, 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Company Details
    doc.setFontSize(10);
    doc.text(biz.name, 20, 38);
    doc.setFontSize(9);
    doc.text(biz.address, 20, 44);
    doc.text(`Phone: ${biz.phone} | Email: ${biz.email}`, 20, 50);
    if (biz.gstNumber) doc.text(`GSTIN: ${biz.gstNumber}`, 20, 56);
    
    // Invoice Details
    doc.setFontSize(10);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 145, 38);
    doc.text(`Billed Date: ${new Date(invoice.date).toLocaleDateString()}`, 145, 44);
    doc.text(`Status: ${invoice.status}`, 145, 50);
    
    // Customer Details
    doc.setFontSize(10);
    doc.text('Bill To:', 20, 68);
    doc.setFontSize(9);
    doc.text(invoice.customerName, 20, 74);
    if (invoice.customerGST) doc.text(`GSTIN: ${invoice.customerGST}`, 20, 80);
    
    // Table
    const tableData = invoice.items.map(item => [
      item.name,
      `${item.quantity} ${item.unit || 'piece'}`,
      `₹${item.price.toLocaleString('en-IN')}`,
      `${item.gst}%`,
      `₹${item.total.toLocaleString('en-IN')}`
    ]);
    
    doc.autoTable({
      startY: 88,
      head: [['Description', 'Qty', 'Price', 'GST', 'Total']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    
    const finalY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(10);
    doc.text(`Subtotal: ₹${invoice.subtotal.toLocaleString('en-IN')}`, 145, finalY);
    doc.text(`GST Total: ₹${invoice.gstTotal.toLocaleString('en-IN')}`, 145, finalY + 6);
    doc.setFontSize(12);
    doc.setTextColor(59, 130, 246);
    doc.text(`Grand Total: ₹${invoice.total.toLocaleString('en-IN')}`, 145, finalY + 15);
    
    doc.save(`Invoice_${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const handleRecordPayment = async (inv) => {
    await updateInvoiceStatus(inv._id, 'Paid');
    setSelectedInvoice(null);
  };

  const statusConfig = {
    Paid: { label: 'Paid', icon: CheckCircle, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' },
    Pending: { label: 'Pending', icon: Clock, cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800' },
    Overdue: { label: 'Overdue', icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800' },
  };

  if (isCreating) {
    // PREMIUM FULL-PAGE BILLING DESK WORKSPACE
    return (
      <div className="space-y-6 pb-6 animate-fade-in font-sans">
        {/* Header Save Workspace */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setIsCreating(false); resetBillingDesk(); }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-500 transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles className="text-blue-500" size={16} />
                <span>Advanced Billing Panel</span>
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">Real-time ledger entries, multi-category tax billing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleGenerateInvoice('Pending')}
              disabled={billingItems.length === 0}
              className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-50 transition"
            >
              Save Draft (Pending)
            </button>
            <button
              onClick={() => handleGenerateInvoice('Paid')}
              disabled={billingItems.length === 0}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              <CreditCard size={13} />
              <span>Record &amp; Settle (Paid)</span>
            </button>
          </div>
        </div>

        {/* Workspace Split */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          
          {/* Left Panel: Controls */}
          <div className="w-full xl:w-5/12 space-y-6 shrink-0 sticky top-4">
            
            {/* configurations card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag size={14} className="text-emerald-500" />
                <span>Invoice Settings</span>
              </h3>

              <div className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  {/* Select category */}
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Category</label>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
                    >
                      <optgroup label="Standard">
                        <option value="general">General / Retail</option>
                        <option value="medical">Medical / Pharmacy</option>
                        <option value="department">Department Store</option>
                        <option value="it">IT Services</option>
                        <option value="restaurant">Restaurant & Cafe</option>
                        <option value="automobile">Automobile</option>
                        <option value="realestate">Real Estate</option>
                        <option value="education">Education</option>
                        <option value="salon">Salon & Spa</option>
                        <option value="construction">Construction</option>
                      </optgroup>
                      {customCategories.length > 0 && (
                        <optgroup label="Custom">
                          {customCategories.map(cat => (
                            <option key={cat._id} value={cat.name.toLowerCase().replace(/\s+/g, '_')}>{cat.name}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                {/* Client selector */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase">Billed Customer</label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value);
                      // Auto-fill from customer record
                      const cust = customers.find(c => c._id === e.target.value);
                      if (cust) {
                        setCustomerPhone(cust.phone || '');
                        setCustomerEmail(cust.email || '');
                        setCustomerAddress(cust.address || '');
                      } else {
                        setCustomerPhone(''); setCustomerEmail(''); setCustomerAddress('');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
                  >
                    <option value="">Walk-in / New Customer</option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>{c.name} {c.phone && `· ${c.phone}`}</option>
                    ))}
                  </select>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Customer Name (if walk-in)"
                      value={selectedCustomer ? (customers.find(c => c._id === selectedCustomer)?.name || '') : customerPhone ? '' : ''}
                      readOnly={!!selectedCustomer}
                      onChange={() => {}}
                      className="col-span-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 dark:text-white text-xs focus:outline-none placeholder:text-slate-400"
                    />
                    <input
                      type="tel"
                      placeholder="📞 Phone Number"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="✉ Email (optional)"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
                    />
                    <textarea
                      rows="2"
                      placeholder="Customer Address (optional)"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="col-span-2 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Adding item panel */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ListPlus size={14} className="text-blue-500" />
                <span>Add Products or Custom Services</span>
              </h3>

              {/* Grid split for Catalogue Select & Custom Line Item */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Autocomplete Catalogue Select */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Search Product Catalog</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Type item name or HSN code..."
                      value={productQuery}
                      onChange={e => { setProductQuery(e.target.value); setShowProductSuggestions(true); }}
                      onFocus={() => setShowProductSuggestions(true)}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
                    />
                    
                    {/* Autocomplete List overlay */}
                    {showProductSuggestions && productSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-750">
                        {productSuggestions.map(p => (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => selectProductSuggestion(p)}
                            className="w-full text-left px-4 py-2.5 text-xs hover:bg-blue-50 dark:hover:bg-slate-700/50 dark:text-slate-200 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-semibold">{p.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">HSN: {p.hsn || 'N/A'} • Unit: {p.unit || 'pcs'}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="font-bold text-blue-600 dark:text-blue-400">₹{p.price}</p>
                              <p className="text-[9px] text-slate-400">Stock: {p.stock}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Item Quick Form */}
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Or Add Custom Line Item</p>
                  <div className="grid gap-2 grid-cols-2">
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={customItemName}
                      onChange={e => setCustomItemName(e.target.value)}
                      className="col-span-2 px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={customItemPrice}
                      onChange={e => setCustomItemPrice(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-xs focus:outline-none"
                    />
                    <select
                      value={customItemGst}
                      onChange={e => setCustomItemGst(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-xs focus:outline-none bg-white"
                    >
                      <option value="0">0% GST</option>
                      <option value="5">5% GST</option>
                      <option value="12">12% GST</option>
                      <option value="18">18% GST</option>
                      <option value="28">28% GST</option>
                    </select>
                    <button
                      type="button"
                      onClick={addCustomItem}
                      className="col-span-2 py-1.5 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Add Custom Item
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Items summary */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Billed Items Summary</h3>
              
              {billingItems.length === 0 ? (
                <div className="py-12 border border-dashed rounded-2xl text-center text-slate-400 dark:text-slate-500 text-xs bg-slate-50 dark:bg-slate-700/10">
                  Select products or add custom items to populate this list.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-100 dark:border-slate-700 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="p-3">Item Details</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Rate</th>
                        <th className="p-3 text-right">Tax (GST)</th>
                        <th className="p-3 text-right">Subtotal</th>
                        <th className="p-3 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {billingItems.map((item, idx) => (
                        <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                          <td className="p-3">
                            <p className="font-bold text-slate-850 dark:text-slate-200">{item.name}</p>
                            {item.hsn && <span className="text-[9px] text-slate-400">HSN: {item.hsn}</span>}
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-650 rounded-lg p-1 bg-white dark:bg-slate-700">
                              <button type="button" onClick={() => updateItemQty(idx, -1)} className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-200 font-bold">-</button>
                              <span className="font-bold text-slate-800 dark:text-slate-100 w-6 text-center">{item.quantity}</span>
                              <button type="button" onClick={() => updateItemQty(idx, 1)} className="w-5 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-200 font-bold">+</button>
                            </div>
                            <span className="text-[10px] text-slate-400 ml-1.5">{item.unit || 'pcs'}</span>
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-600 dark:text-slate-300">₹{item.price.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-right font-medium text-slate-500">{item.gst}%</td>
                          <td className="p-3 text-right font-bold text-slate-850 dark:text-slate-100">₹{item.total.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => removeBillingItem(idx)}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500 transition"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Dynamic category billing parameters */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Layers size={14} className="text-violet-500" />
                <span>Billing Category Parameters</span>
              </h3>
              
              {!isCustomCategory ? (
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {activeCategory === 'medical' && (
                    <>
                      <input
                        type="text"
                        placeholder="Doctor Name"
                        value={extraFields.doctorName}
                        onChange={(e) => handleExtraFieldChange('doctorName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Patient Name"
                        value={extraFields.patientName}
                        onChange={(e) => handleExtraFieldChange('patientName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Patient Phone"
                        value={extraFields.patientPhone}
                        onChange={(e) => handleExtraFieldChange('patientPhone', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Rx Prescription Ref No"
                        value={extraFields.rxNumber}
                        onChange={(e) => handleExtraFieldChange('rxNumber', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                    </>
                  )}

                  {activeCategory === 'restaurant' && (
                    <>
                      <input
                        type="text"
                        placeholder="Table Number (e.g. Table 4)"
                        value={extraFields.tableNumber}
                        onChange={(e) => handleExtraFieldChange('tableNumber', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Waiter / Server Name"
                        value={extraFields.waiterName}
                        onChange={(e) => handleExtraFieldChange('waiterName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Pax Count"
                        value={extraFields.paxCount}
                        onChange={(e) => handleExtraFieldChange('paxCount', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                    </>
                  )}

                  {activeCategory === 'automobile' && (
                    <>
                      <input
                        type="text"
                        placeholder="Vehicle Registration No"
                        value={extraFields.vehicleNumber}
                        onChange={(e) => handleExtraFieldChange('vehicleNumber', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none font-mono uppercase"
                      />
                      <input
                        type="text"
                        placeholder="Vehicle Model / Brand"
                        value={extraFields.vehicleModel}
                        onChange={(e) => handleExtraFieldChange('vehicleModel', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Odometer Reading (km)"
                        value={extraFields.odometerReading}
                        onChange={(e) => handleExtraFieldChange('odometerReading', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Service Advisor"
                        value={extraFields.advisorName}
                        onChange={(e) => handleExtraFieldChange('advisorName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                    </>
                  )}

                  {activeCategory === 'realestate' && (
                    <>
                      <input
                        type="text"
                        placeholder="Property Address / Block ID"
                        value={extraFields.propertyAddress}
                        onChange={(e) => handleExtraFieldChange('propertyAddress', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Tenant Name"
                        value={extraFields.tenantName}
                        onChange={(e) => handleExtraFieldChange('tenantName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Lease Period"
                        value={extraFields.leasePeriod}
                        onChange={(e) => handleExtraFieldChange('leasePeriod', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Security Deposit (₹)"
                        value={extraFields.securityDeposit}
                        onChange={(e) => handleExtraFieldChange('securityDeposit', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                    </>
                  )}

                  {activeCategory === 'education' && (
                    <>
                      <input
                        type="text"
                        placeholder="Student Name"
                        value={extraFields.studentName}
                        onChange={(e) => handleExtraFieldChange('studentName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Roll / Registration No"
                        value={extraFields.rollNumber}
                        onChange={(e) => handleExtraFieldChange('rollNumber', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Class / Batch Name"
                        value={extraFields.classBatch}
                        onChange={(e) => handleExtraFieldChange('classBatch', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Academic Term"
                        value={extraFields.academicTerm}
                        onChange={(e) => handleExtraFieldChange('academicTerm', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                    </>
                  )}

                  {activeCategory === 'salon' && (
                    <>
                      <input
                        type="text"
                        placeholder="Stylist / Therapist Name"
                        value={extraFields.stylistName}
                        onChange={(e) => handleExtraFieldChange('stylistName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Membership Card ID"
                        value={extraFields.membershipId}
                        onChange={(e) => handleExtraFieldChange('membershipId', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                    </>
                  )}

                  {activeCategory === 'construction' && (
                    <>
                      <input
                        type="text"
                        placeholder="Challan Number"
                        value={extraFields.challanNumber}
                        onChange={(e) => handleExtraFieldChange('challanNumber', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Truck / Transport Vehicle No"
                        value={extraFields.truckNumber}
                        onChange={(e) => handleExtraFieldChange('truckNumber', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Site Supervisor"
                        value={extraFields.supervisorName}
                        onChange={(e) => handleExtraFieldChange('supervisorName', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Loading charges (₹)"
                        value={extraFields.loadingCharges}
                        onChange={(e) => handleExtraFieldChange('loadingCharges', e.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  {getSelectedCustomCategory()?.fields.map(f => (
                    <input
                      key={f.key}
                      type="text"
                      placeholder={f.label}
                      value={extraFields[f.key] || ''}
                      onChange={(e) => handleExtraFieldChange(f.key, e.target.value)}
                      className="rounded-xl border border-slate-200 dark:border-slate-600 p-2.5 dark:bg-slate-700 dark:text-white focus:outline-none"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Right Panel: Live Invoice Rendering */}
          <div className="w-full xl:w-7/12 sticky top-4">
            <div className="bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 sm:p-4 shadow-inner max-h-[85vh] overflow-y-auto hidden-scrollbar relative group">
              
              {/* Badge */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-300">
                <span className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">Live Preview Active</span>
              </div>
              
              {/* Scale wrapper to fit */}
              <div className="origin-top flex justify-center">
                <div className="w-full max-w-[800px] pointer-events-none">
                  <InvoiceTemplateRenderer 
                    invoice={livePreviewInvoice} 
                    companySettings={companySettings} 
                    customCategories={customCategories} 
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // STANDARD INVOICES LIST VIEW
  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Invoices</h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Manage, issue and track cash-flow collections</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition self-start sm:self-auto font-sans"
        >
          <Plus size={16} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoiced', value: `₹${stats.totalAmount.toLocaleString('en-IN')}`, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', Icon: FileText },
          { label: 'Settled Bills', value: stats.paid, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', Icon: CheckCircle },
          { label: 'Pending Bills', value: stats.pending, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20', Icon: Clock },
          { label: 'Overdue Bills', value: stats.overdue, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20', Icon: AlertCircle },
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
              <p className={`text-xl font-extrabold mt-1.5 ${s.color}`}>{s.value}</p>
            </div>
            <div className={`p-2 rounded-xl ${s.bg}`}>
              <s.Icon size={18} className={s.color} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search invoices by customer name or bill number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 dark:text-white text-sm cursor-pointer focus:outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-16 text-center">
            <FileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No invoices found</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Try resetting the status filter or search queries</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Bill No</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Customer Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Grand Total</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden sm:table-cell">Billed Date</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredInvoices.map((invoice, index) => {
                  const sc = statusConfig[invoice.status] || statusConfig.Pending;
                  return (
                    <motion.tr
                      key={invoice._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
                    >
                      <td className="px-5 py-4 font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{invoice.invoiceNumber}</td>
                      <td className="px-5 py-4 font-semibold text-slate-805 dark:text-slate-100 truncate max-w-[150px]">{invoice.customerName}</td>
                      <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">₹{invoice.total?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs hidden sm:table-cell">{new Date(invoice.date).toLocaleDateString('en-IN')}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs hidden md:table-cell capitalize">{invoice.businessType}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${sc.cls}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 transition"
                            title="Preview & Print"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => downloadPDF(invoice)}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition"
                            title="Download PDF"
                          >
                            <Download size={15} />
                          </button>
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

      {/* Invoice Detail Viewer */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          companySettings={companySettings}
          onRecordPayment={handleRecordPayment}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};

export default Invoices;