import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const InvoiceModal = ({ onClose, onCreate }) => {
  const { customers, products, invoiceTemplate, businessType, customCategories } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(invoiceTemplate);
  const [activeCategory, setActiveCategory] = useState(businessType);

  // Dynamic input fields for custom categories
  const [extraFields, setExtraFields] = useState({
    doctorName: '', patientName: '', patientPhone: '', rxNumber: '', // medical
    tableNumber: '', waiterName: '', paxCount: '1', // restaurant
    vehicleNumber: '', vehicleModel: '', odometerReading: '', advisorName: '', // automobile
    propertyAddress: '', tenantName: '', leasePeriod: '', securityDeposit: '0', // realestate
    studentName: '', rollNumber: '', classBatch: '', academicTerm: '', // education
    stylistName: '', membershipId: '', // salon
    challanNumber: '', truckNumber: '', supervisorName: '', loadingCharges: '0' // construction
  });

  const handleExtraFieldChange = (key, value) => {
    setExtraFields({ ...extraFields, [key]: value });
  };

  const addItem = () => {
    const product = products.find(p => p._id === selectedProduct);
    if (product) {
      const itemTotal = product.price * quantity * (1 + product.gst / 100);
      setItems([...items, { 
        ...product, 
        quantity, 
        total: itemTotal 
      }]);
      setSelectedProduct('');
      setQuantity(1);
    }
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const baseTotal = items.reduce((sum, item) => sum + item.total, 0);
    // Add loading charges if construction billing is active
    if (activeCategory === 'construction' && extraFields.loadingCharges) {
      return baseTotal + parseFloat(extraFields.loadingCharges || '0');
    }
    return baseTotal;
  };

  const isCustomCategory = !['general', 'medical', 'department', 'it', 'restaurant', 'automobile', 'realestate', 'education', 'salon', 'construction'].includes(activeCategory);
  
  const getSelectedCustomCategory = () => {
    return customCategories.find(cat => cat.name.toLowerCase().replace(/\s+/g, '_') === activeCategory);
  };

  const handleSubmit = () => {
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
      customerGST: customer?.gstNumber || '',
      template: selectedTemplate,
      extraFields: relevantExtraFields,
      businessType: activeCategory,
      items: items.map(item => ({
        productId: item._id,
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
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      gstTotal: items.reduce((sum, item) => sum + (item.price * item.quantity * item.gst / 100), 0),
      total: calculateTotal()
    };
    onCreate(invoiceData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl border flex flex-col">
        
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Appz2mate Billing Workspace</h2>
            <p className="text-slate-400 text-xs mt-0.5">Generate customized tax receipts and job cards</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          {/* Category & Template selection */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Billing Category</label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white text-sm cursor-pointer"
              >
                <optgroup label="Standard Categories">
                  <option value="general">General / Retail</option>
                  <option value="medical">Medical / Pharmacy</option>
                  <option value="department">Department Store / POS</option>
                  <option value="it">IT Services & Consulting</option>
                  <option value="restaurant">Restaurant & Cafe</option>
                  <option value="automobile">Automobile & Garage</option>
                  <option value="realestate">Real Estate & Property</option>
                  <option value="education">Education & Tuition</option>
                  <option value="salon">Salon & Spa Wellness</option>
                  <option value="construction">Construction & Hardware</option>
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

            {/* Template Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Bill Layout Design</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white text-sm cursor-pointer"
              >
                <option value="classic">Classic (Template 1)</option>
                <option value="modern">Modern (Template 2)</option>
                <option value="premium">Premium (Template 3)</option>
              </select>
            </div>

            {/* Customer Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Select Client</label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl dark:bg-gray-700 dark:border-gray-600 bg-white text-sm cursor-pointer"
              >
                <option value="">Walk-in Customer</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>{customer.name} {customer.gstNumber && `(GSTIN: ${customer.gstNumber})`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Billing Category Input Sheets */}
          {!isCustomCategory ? (
            <>
              {activeCategory === 'medical' && (
                <div className="bg-red-50/40 border border-red-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="col-span-2 font-bold text-red-700 text-xs uppercase tracking-wider">Pharma billing options</div>
                  <input
                    type="text"
                    placeholder="Doctor Name"
                    value={extraFields.doctorName}
                    onChange={(e) => handleExtraFieldChange('doctorName', e.target.value)}
                    className="rounded-xl border border-red-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Patient Name"
                    value={extraFields.patientName}
                    onChange={(e) => handleExtraFieldChange('patientName', e.target.value)}
                    className="rounded-xl border border-red-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Patient Phone"
                    value={extraFields.patientPhone}
                    onChange={(e) => handleExtraFieldChange('patientPhone', e.target.value)}
                    className="rounded-xl border border-red-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Rx Prescription Ref No"
                    value={extraFields.rxNumber}
                    onChange={(e) => handleExtraFieldChange('rxNumber', e.target.value)}
                    className="rounded-xl border border-red-200 p-2.5 bg-white focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'restaurant' && (
                <div className="bg-amber-50/40 border border-amber-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-3 text-sm">
                  <div className="col-span-3 font-bold text-amber-700 text-xs uppercase tracking-wider">Restaurant table booking details</div>
                  <input
                    type="text"
                    placeholder="Table Number (e.g. Table 4)"
                    value={extraFields.tableNumber}
                    onChange={(e) => handleExtraFieldChange('tableNumber', e.target.value)}
                    className="rounded-xl border border-amber-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Waiter / Server Name"
                    value={extraFields.waiterName}
                    onChange={(e) => handleExtraFieldChange('waiterName', e.target.value)}
                    className="rounded-xl border border-amber-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Pax Count"
                    value={extraFields.paxCount}
                    onChange={(e) => handleExtraFieldChange('paxCount', e.target.value)}
                    className="rounded-xl border border-amber-200 p-2.5 bg-white focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'automobile' && (
                <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="col-span-2 font-bold text-indigo-700 text-xs uppercase tracking-wider">Garage service advisor records</div>
                  <input
                    type="text"
                    placeholder="Vehicle Registration No (e.g. MH12AB1234)"
                    value={extraFields.vehicleNumber}
                    onChange={(e) => handleExtraFieldChange('vehicleNumber', e.target.value)}
                    className="rounded-xl border border-indigo-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Vehicle Brand / Model"
                    value={extraFields.vehicleModel}
                    onChange={(e) => handleExtraFieldChange('vehicleModel', e.target.value)}
                    className="rounded-xl border border-indigo-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Odometer Reading (km)"
                    value={extraFields.odometerReading}
                    onChange={(e) => handleExtraFieldChange('odometerReading', e.target.value)}
                    className="rounded-xl border border-indigo-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Service Advisor"
                    value={extraFields.advisorName}
                    onChange={(e) => handleExtraFieldChange('advisorName', e.target.value)}
                    className="rounded-xl border border-indigo-200 p-2.5 bg-white focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'realestate' && (
                <div className="bg-purple-50/40 border border-purple-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="col-span-2 font-bold text-purple-700 text-xs uppercase tracking-wider">Tenant and lease records</div>
                  <input
                    type="text"
                    placeholder="Property Address / Block ID"
                    value={extraFields.propertyAddress}
                    onChange={(e) => handleExtraFieldChange('propertyAddress', e.target.value)}
                    className="rounded-xl border border-purple-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Tenant / Occupant Name"
                    value={extraFields.tenantName}
                    onChange={(e) => handleExtraFieldChange('tenantName', e.target.value)}
                    className="rounded-xl border border-purple-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Lease Period (e.g. Jan 2026 - Dec 2026)"
                    value={extraFields.leasePeriod}
                    onChange={(e) => handleExtraFieldChange('leasePeriod', e.target.value)}
                    className="rounded-xl border border-purple-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Security Deposit (₹)"
                    value={extraFields.securityDeposit}
                    onChange={(e) => handleExtraFieldChange('securityDeposit', e.target.value)}
                    className="rounded-xl border border-purple-200 p-2.5 bg-white focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'education' && (
                <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="col-span-2 font-bold text-emerald-700 text-xs uppercase tracking-wider">Coaching institute details</div>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={extraFields.studentName}
                    onChange={(e) => handleExtraFieldChange('studentName', e.target.value)}
                    className="rounded-xl border border-emerald-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Registration / Roll Number"
                    value={extraFields.rollNumber}
                    onChange={(e) => handleExtraFieldChange('rollNumber', e.target.value)}
                    className="rounded-xl border border-emerald-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Class Batch / Stream"
                    value={extraFields.classBatch}
                    onChange={(e) => handleExtraFieldChange('classBatch', e.target.value)}
                    className="rounded-xl border border-emerald-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Academic Term (e.g. Term 1)"
                    value={extraFields.academicTerm}
                    onChange={(e) => handleExtraFieldChange('academicTerm', e.target.value)}
                    className="rounded-xl border border-emerald-200 p-2.5 bg-white focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'salon' && (
                <div className="bg-pink-50/40 border border-pink-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="col-span-2 font-bold text-pink-700 text-xs uppercase tracking-wider">Salon therapist records</div>
                  <input
                    type="text"
                    placeholder="Stylist / Therapist Name"
                    value={extraFields.stylistName}
                    onChange={(e) => handleExtraFieldChange('stylistName', e.target.value)}
                    className="rounded-xl border border-pink-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Member Card / Membership ID"
                    value={extraFields.membershipId}
                    onChange={(e) => handleExtraFieldChange('membershipId', e.target.value)}
                    className="rounded-xl border border-pink-200 p-2.5 bg-white focus:outline-none"
                  />
                </div>
              )}

              {activeCategory === 'construction' && (
                <div className="bg-yellow-50/40 border border-yellow-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-2 text-sm">
                  <div className="col-span-2 font-bold text-yellow-700 text-xs uppercase tracking-wider">Hardware loading charges</div>
                  <input
                    type="text"
                    placeholder="Delivery Challan No"
                    value={extraFields.challanNumber}
                    onChange={(e) => handleExtraFieldChange('challanNumber', e.target.value)}
                    className="rounded-xl border border-yellow-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Truck / Transport Vehicle No"
                    value={extraFields.truckNumber}
                    onChange={(e) => handleExtraFieldChange('truckNumber', e.target.value)}
                    className="rounded-xl border border-yellow-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Site Supervisor Reference"
                    value={extraFields.supervisorName}
                    onChange={(e) => handleExtraFieldChange('supervisorName', e.target.value)}
                    className="rounded-xl border border-yellow-200 p-2.5 bg-white focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Loading & Offloading Fees (₹)"
                    value={extraFields.loadingCharges}
                    onChange={(e) => handleExtraFieldChange('loadingCharges', e.target.value)}
                    className="rounded-xl border border-yellow-200 p-2.5 bg-white focus:outline-none"
                  />
                </div>
              )}
            </>
          ) : (
            // Dynamic custom category input sheet
            <div className="bg-blue-50/40 border border-blue-100 p-4 rounded-2xl grid gap-4 sm:grid-cols-2 text-sm">
              <div className="col-span-2 font-bold text-blue-700 text-xs uppercase tracking-wider">
                {getSelectedCustomCategory()?.name} Attributes
              </div>
              {getSelectedCustomCategory()?.fields.map((f, i) => (
                <input
                  key={i}
                  type="text"
                  placeholder={f.label}
                  value={extraFields[f.key] || ''}
                  onChange={(e) => handleExtraFieldChange(f.key, e.target.value)}
                  className="rounded-xl border border-blue-200 p-2.5 bg-white focus:outline-none"
                />
              ))}
            </div>
          )}

          {/* Add Items block */}
          <div className="bg-slate-50 border p-4 rounded-2xl">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Add Products / Services to Bill</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 px-4 py-2.5 border rounded-xl bg-white text-sm focus:outline-none"
              >
                <option value="">-- Select Item to Add --</option>
                {products
                  .filter(p => p.businessType === activeCategory || p.businessType === 'general')
                  .map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} - ₹{product.price} (GST: {product.gst}%) [Stock: {product.stock}]
                    </option>
                  ))}
              </select>
              <div className="flex gap-2 shrink-0">
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2.5 border rounded-xl text-center text-sm"
                  min="1"
                  placeholder="Qty"
                />
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition flex items-center justify-center cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 ? (
            <div className="overflow-x-auto border rounded-2xl">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-left">
                  <tr>
                    <th className="px-4 py-3">Item Description</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">GST</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                      <td className="px-4 py-3 text-right">{item.quantity} {item.unit || 'piece'}</td>
                      <td className="px-4 py-3 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right">{item.gst}%</td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">₹{item.total.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => removeItem(index)} className="text-red-500 hover:text-red-600 transition p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 border-t">
                  {activeCategory === 'construction' && extraFields.loadingCharges && (
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right font-semibold text-slate-500">Material Loading Charges:</td>
                      <td className="px-4 py-2 text-right font-bold text-slate-700">₹{parseFloat(extraFields.loadingCharges).toLocaleString('en-IN')}</td>
                      <td></td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-right font-bold text-slate-700 text-base">Grand Total:</td>
                    <td className="px-4 py-3 text-right font-extrabold text-blue-600 text-lg">₹{calculateTotal().toLocaleString('en-IN')}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="py-12 border border-dashed rounded-3xl text-center text-slate-400 text-sm bg-slate-50">
              Your billing list is currently empty. Add products to generate a tax receipt.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-6 flex justify-end space-x-3 z-10">
          <button onClick={onClose} className="px-5 py-3 border rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-semibold cursor-pointer">
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={items.length === 0}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white rounded-2xl text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-blue-500/15 disabled:shadow-none"
          >
            Generate Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;