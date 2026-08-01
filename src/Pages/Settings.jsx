import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { motion } from 'framer-motion';
import { Trash2, Plus, Settings as SettingsIcon, Shield, Building, CreditCard, Sparkles, Upload, Image as ImageIcon, PenLine, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings = () => {
  const { companySettings, updateCompanySettings, user, customCategories, addCustomCategory, deleteCustomCategory } = useApp();
  
  const [formData, setFormData] = useState({
    name: 'My Business',
    email: 'contact@mybusiness.com',
    phone: '+91 9876543210',
    address: '123 Business Street, City - 400001',
    gstNumber: '27AAAAA1234A1Z',
    panNumber: 'AAAAA1234A',
    businessType: 'general',
    invoiceTemplate: 'classic',
    bankName: '',
    bankAccount: '',
    bankIfsc: '',
    currency: 'INR',
    logo: null,
    signature: null,
    signatoryName: ''
  });

  const signaturePadRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  // Custom Category Builder states
  const [newCatName, setNewCatName] = useState('');
  const [customFields, setCustomFields] = useState(['', '', '', '']);

  useEffect(() => {
    if (companySettings) {
      setFormData({
        name: companySettings.name || 'My Business',
        email: companySettings.email || '',
        phone: companySettings.phone || '',
        address: companySettings.address || '',
        gstNumber: companySettings.gstNumber || '',
        panNumber: companySettings.panNumber || '',
        businessType: companySettings.businessType || 'general',
        invoiceTemplate: companySettings.invoiceTemplate || 'classic',
        bankName: companySettings.bankName || '',
        bankAccount: companySettings.bankAccount || '',
        bankIfsc: companySettings.bankIfsc || '',
        currency: companySettings.currency || 'INR',
        logo: companySettings.logo || null,
        signature: companySettings.signature || null,
        signatoryName: companySettings.signatoryName || ''
      });
    }
  }, [companySettings]);

  useEffect(() => {
    if (companySettings?.signature) {
      const loadSignature = () => {
        const canvas = signaturePadRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = companySettings.signature;
        } else {
          setTimeout(loadSignature, 100);
        }
      };
      loadSignature();
    }
  }, [companySettings]);

  const handleSaveSettings = async () => {
    await updateCompanySettings(formData);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Logo file size must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result }));
        toast.success("Logo uploaded. Click 'Save Changes' to apply.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: null }));
    toast.success("Logo removed. Click 'Save Changes' to apply.");
  };

  // Signature drawing handlers
  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    // Account for CSS scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { 
      x: (touch.clientX - rect.left) * scaleX, 
      y: (touch.clientY - rect.top) * scaleY 
    };
  };

  const startDrawing = (e) => {
    const canvas = signaturePadRef.current;
    const pos = getPos(e, canvas);
    lastX.current = pos.x;
    lastY.current = pos.y;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = signaturePadRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const pos = getPos(e, canvas);
    
    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX.current = pos.x;
    lastY.current = pos.y;
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = signaturePadRef.current;
      setFormData(prev => ({ ...prev, signature: canvas.toDataURL() }));
    }
  };

  const clearSignature = () => {
    const canvas = signaturePadRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, signature: null }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, signature: reader.result }));
        const canvas = signaturePadRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = reader.result;
        }
        toast.success("Signature uploaded.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    const defaultDesign = {
      general: 'classic',
      medical: 'medical',
      department: 'retail',
      it: 'service',
      restaurant: 'restaurant',
      automobile: 'automobile',
      realestate: 'realestate',
      education: 'education',
      salon: 'salon',
      construction: 'construction'
    }[value] || 'classic';

    setFormData({
      ...formData,
      businessType: value,
      invoiceTemplate: defaultDesign
    });
  };

  const handleAddFieldChange = (index, value) => {
    const fieldsCopy = [...customFields];
    fieldsCopy[index] = value;
    setCustomFields(fieldsCopy);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const filteredFields = customFields
      .filter(f => f.trim() !== '')
      .map(f => ({
        label: f.trim(),
        key: f.trim().toLowerCase().replace(/\s+/g, '_')
      }));

    const result = await addCustomCategory(newCatName.trim(), filteredFields);
    if (result) {
      setNewCatName('');
      setCustomFields(['', '', '', '']);
    }
  };

  return (
    <div className="space-y-6 pb-6 animate-fade-in">
      {/* Top Save Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings Workspace</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure company details, logo, bank details, tax codes, and custom categories</p>
          </div>
          <button 
            onClick={handleSaveSettings}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition self-start sm:self-auto font-sans"
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Company Profile Form */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building size={16} className="text-blue-500" />
            <span>Business Profile Details</span>
          </h3>

          {/* Logo Uploader */}
          <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative group">
              {formData.logo ? (
                <img src={formData.logo} alt="Company Logo" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon size={28} className="text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <div className="text-center sm:text-left space-y-2">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">Company Identity Logo</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Supports PNG, JPG, or SVG under 1MB. Displays on printable tax bills.</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 cursor-pointer transition">
                  <Upload size={12} />
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </label>
                {formData.logo && (
                  <button 
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Registered Business Name</label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Billing Email</label>
              <input 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Contact Phone</label>
              <input 
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Postal / Billing Address</label>
              <textarea 
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">GSTIN Number</label>
              <input 
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">PAN Number</label>
              <input 
                type="text"
                value={formData.panNumber}
                onChange={(e) => setFormData({...formData, panNumber: e.target.value})}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Bank & Preferences Forms */}
        <div className="space-y-6">
          {/* Bank Details section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard size={16} className="text-emerald-500" />
              <span>Bank Payment Details</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Bank Name</label>
                <input 
                  type="text"
                  placeholder="e.g. HDFC Bank"
                  value={formData.bankName}
                  onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Account Number</label>
                <input 
                  type="text"
                  placeholder="15 digits account no"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">IFSC Code</label>
                <input 
                  type="text"
                  placeholder="e.g. HDFC0000123"
                  value={formData.bankIfsc}
                  onChange={(e) => setFormData({...formData, bankIfsc: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Signature Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenLine size={16} className="text-purple-500" />
              <span>Authorized Signatory</span>
            </h3>
            <p className="text-xs text-slate-400">This signature will appear on all invoices. Draw it below or upload an image.</p>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Signatory Name</label>
              <input
                type="text"
                placeholder="e.g. R. Dilip Kumar"
                value={formData.signatoryName}
                onChange={(e) => setFormData({...formData, signatoryName: e.target.value})}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Draw Signature</label>
              <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700/30 overflow-hidden">
                <canvas
                  ref={signaturePadRef}
                  width={480}
                  height={120}
                  className="w-full cursor-crosshair touch-none"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 text-xs pointer-events-none select-none">Sign here ✍</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button type="button" onClick={clearSignature} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition">
                  <X size={12} /> Clear
                </button>
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 cursor-pointer transition">
                  <Upload size={12} /> Upload Signature Image
                  <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                </label>
              </div>
            </div>

            {formData.signature && (
              <div className="p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] text-slate-400 uppercase font-semibold mb-2">Signature Preview</p>
                <img src={formData.signature} alt="Signature" className="max-h-16 object-contain" />
              </div>
            )}
          </div>

          {/* Invoice Category Configurations */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-violet-500" />
              <span>Defaults Settings</span>
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Business Category</label>
                <select
                  value={formData.businessType}
                  onChange={handleCategoryChange}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                >
                  <optgroup label="Standard Categories">
                    <option value="general">General / Retail</option>
                    <option value="medical">Medical / Pharmacy</option>
                    <option value="department">Department Store / POS</option>
                    <option value="it">IT Services &amp; Consulting</option>
                    <option value="restaurant">Restaurant &amp; Cafe</option>
                    <option value="automobile">Automobile &amp; Garage</option>
                    <option value="realestate">Real Estate &amp; Property</option>
                    <option value="education">Education &amp; Tuition</option>
                    <option value="salon">Salon &amp; Spa Wellness</option>
                    <option value="construction">Construction &amp; Hardware</option>
                  </optgroup>
                  {customCategories.length > 0 && (
                    <optgroup label="Custom Categories">
                      {customCategories.map(cat => (
                        <option key={cat._id} value={cat.name.toLowerCase().replace(/\s+/g, '_')}>{cat.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Default Layout</label>
                <select
                  value={formData.invoiceTemplate}
                  onChange={(e) => setFormData({...formData, invoiceTemplate: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none bg-white"
                >
                  <option value="classic">Classic (Template 1)</option>
                  <option value="modern">Modern (Template 2)</option>
                  <option value="premium">Premium (Template 3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Session details */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield size={16} className="text-slate-500" />
              <span>Workspace Info</span>
            </h3>
            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-2">
              <p><strong>Username:</strong> {user?.name}</p>
              <p><strong>Role:</strong> {user?.role}</p>
              <p><strong>Workspace Email:</strong> {user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Builder Block */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SettingsIcon size={16} className="text-blue-500" />
            <span>Create Custom Category</span>
          </h3>
          <p className="text-xs text-slate-400">Design your own business category with custom billing attributes</p>
          
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category Name</label>
              <input
                type="text"
                placeholder="e.g. Photography Services"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-3 text-sm focus:outline-none"
                required
              />
            </div>
            
            <div className="space-y-2.5">
              <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Custom Fields (Max 4)</label>
              {customFields.map((field, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold w-6">#{idx + 1}</span>
                  <input
                    type="text"
                    placeholder={`e.g. ${idx === 0 ? 'Shoot Date' : idx === 1 ? 'Venue Name' : 'Client Phone'}`}
                    value={field}
                    onChange={(e) => handleAddFieldChange(idx, e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2.5 text-sm focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition text-sm cursor-pointer shadow-lg shadow-blue-500/10 flex items-center justify-center gap-1"
            >
              <Plus size={16} />
              <span>Create Category</span>
            </button>
          </form>
        </div>

        {/* Existing Custom Categories List */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Custom Category Manager</h3>
          <p className="text-xs text-slate-400 mt-1">View and remove user-defined categories</p>
          
          <div className="mt-4 flex-1 overflow-y-auto max-h-[350px] space-y-3 pr-1">
            {customCategories.map(cat => (
              <div key={cat._id} className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">{cat.name}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {cat.fields.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase">
                        {f.label}
                      </span>
                    ))}
                    {cat.fields.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No custom fields</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteCustomCategory(cat._id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded-lg transition"
                  title="Remove Category"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            
            {customCategories.length === 0 && (
              <div className="h-full flex items-center justify-center text-slate-400 py-12 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-700/20">
                No custom categories created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;