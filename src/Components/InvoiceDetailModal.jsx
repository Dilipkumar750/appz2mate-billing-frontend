import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, CreditCard } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';

const InvoiceTemplateRenderer = ({ invoice, companySettings, customCategories }) => {
  const getExtraVal = (key) => {
    if (!invoice.extraFields) return '';
    if (invoice.extraFields instanceof Map) {
      return invoice.extraFields.get(key) || '';
    }
    return invoice.extraFields[key] || '';
  };

  const isCustomCategory = !['general', 'medical', 'department', 'it', 'restaurant', 'automobile', 'realestate', 'education', 'salon', 'construction'].includes(invoice.businessType);

  const getCustomCategoryFields = () => {
    const catNameNormalized = invoice.businessType;
    const cat = customCategories.find(c => c.name.toLowerCase().replace(/\s+/g, '_') === catNameNormalized);
    return cat ? cat.fields : [];
  };

  const renderExtraAttributes = () => {
    if (isCustomCategory) {
      const fields = getCustomCategoryFields();
      if (fields.length === 0) return null;
      return (
        <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs mb-4 font-sans">
          {fields.map(f => (
            <p key={f.key}>
              <span className="font-bold text-slate-600">{f.label}:</span> {getExtraVal(f.key) || 'N/A'}
            </p>
          ))}
        </div>
      );
    }

    const mapping = {
      medical: (
        <div className="grid grid-cols-2 gap-3 bg-red-50 p-3 rounded-lg text-xs border border-red-100 mb-4">
          <p><span className="font-bold">Doctor:</span> {getExtraVal('doctorName') || 'N/A'}</p>
          <p><span className="font-bold">Patient:</span> {getExtraVal('patientName') || 'N/A'}</p>
          <p><span className="font-bold">Patient Ph:</span> {getExtraVal('patientPhone') || 'N/A'}</p>
          <p><span className="font-bold">Rx No:</span> {getExtraVal('rxNumber') || 'N/A'}</p>
        </div>
      ),
      restaurant: (
        <div className="grid grid-cols-3 gap-3 bg-amber-50 p-3 rounded-lg text-xs border border-amber-100 mb-4">
          <p><span className="font-bold">Table:</span> {getExtraVal('tableNumber') || 'N/A'}</p>
          <p><span className="font-bold">Waiter:</span> {getExtraVal('waiterName') || 'N/A'}</p>
          <p><span className="font-bold">Pax:</span> {getExtraVal('paxCount') || '1'}</p>
        </div>
      ),
      automobile: (
        <div className="grid grid-cols-2 gap-3 bg-indigo-50 p-3 rounded-lg text-xs border border-indigo-100 mb-4">
          <p><span className="font-bold">Vehicle No:</span> {getExtraVal('vehicleNumber') || 'N/A'}</p>
          <p><span className="font-bold">Model:</span> {getExtraVal('vehicleModel') || 'N/A'}</p>
          <p><span className="font-bold">Odometer:</span> {getExtraVal('odometerReading') || 'N/A'} km</p>
          <p><span className="font-bold">Advisor:</span> {getExtraVal('advisorName') || 'N/A'}</p>
        </div>
      ),
      realestate: (
        <div className="grid grid-cols-2 gap-3 bg-purple-50 p-3 rounded-lg text-xs border border-purple-100 mb-4">
          <p className="col-span-2"><span className="font-bold">Property:</span> {getExtraVal('propertyAddress') || 'N/A'}</p>
          <p><span className="font-bold">Tenant:</span> {getExtraVal('tenantName') || 'N/A'}</p>
          <p><span className="font-bold">Lease:</span> {getExtraVal('leasePeriod') || 'N/A'}</p>
          <p><span className="font-bold">Security Dep:</span> ₹{getExtraVal('securityDeposit') || '0'}</p>
        </div>
      ),
      education: (
        <div className="grid grid-cols-2 gap-3 bg-emerald-50 p-3 rounded-lg text-xs border border-emerald-100 mb-4">
          <p><span className="font-bold">Student:</span> {getExtraVal('studentName') || 'N/A'}</p>
          <p><span className="font-bold">Roll No:</span> {getExtraVal('rollNumber') || 'N/A'}</p>
          <p><span className="font-bold">Class/Batch:</span> {getExtraVal('classBatch') || 'N/A'}</p>
          <p><span className="font-bold">Term:</span> {getExtraVal('academicTerm') || 'N/A'}</p>
        </div>
      ),
      salon: (
        <div className="grid grid-cols-2 gap-3 bg-pink-50 p-3 rounded-lg text-xs border border-pink-100 mb-4">
          <p><span className="font-bold">Stylist:</span> {getExtraVal('stylistName') || 'N/A'}</p>
          <p><span className="font-bold">Membership:</span> {getExtraVal('membershipId') || 'N/A'}</p>
        </div>
      ),
      construction: (
        <div className="grid grid-cols-2 gap-3 bg-yellow-50 p-3 rounded-lg text-xs border border-yellow-100 mb-4">
          <p><span className="font-bold">Challan No:</span> {getExtraVal('challanNumber') || 'N/A'}</p>
          <p><span className="font-bold">Truck No:</span> {getExtraVal('truckNumber') || 'N/A'}</p>
          <p><span className="font-bold">Supervisor:</span> {getExtraVal('supervisorName') || 'N/A'}</p>
          <p><span className="font-bold">Loading:</span> ₹{getExtraVal('loadingCharges') || '0'}</p>
        </div>
      )
    };

    return mapping[invoice.businessType] || null;
  };

  const biz = companySettings || {
    name: 'My Business',
    email: 'contact@mybusiness.com',
    phone: '+91 9876543210',
    address: '123 Business Street, City - 400001',
    gstNumber: '27AAAAA1234A1Z'
  };

  return (
    <div className="bg-white text-black font-sans w-full max-w-4xl mx-auto border border-slate-300" style={{fontFamily: 'Arial, sans-serif'}}>

      {/* Top blue header bar */}
      <div className="bg-blue-700 h-2 w-full" />

      {/* Main Header */}
      <div className="flex justify-between items-start px-8 py-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-blue-700 mb-1">{biz.name}</h1>
          {biz.gstNumber && <p className="text-xs text-slate-600">GST No: <strong>{biz.gstNumber}</strong></p>}
          {biz.panNumber && <p className="text-xs text-slate-600">PAN: <strong>{biz.panNumber}</strong></p>}
          <p className="text-xs text-slate-500 mt-1 whitespace-pre-wrap">{biz.address}</p>
          <p className="text-xs text-slate-500">Ph: {biz.phone} | Email: {biz.email}</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          {biz.logo && (
            <img src={biz.logo} alt="Logo" className="max-h-16 max-w-[120px] object-contain mb-2" />
          )}
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs">
            <div className="flex justify-between gap-6 mb-1">
              <span className="text-slate-500 font-semibold">Invoice #:</span>
              <span className="font-bold text-blue-700">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between gap-6 mb-1">
              <span className="text-slate-500 font-semibold">Date:</span>
              <span className="font-semibold">{new Date(invoice.date).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-slate-500 font-semibold">Status:</span>
              <span className={`font-bold ${invoice.status === 'Paid' ? 'text-green-600' : invoice.status === 'Overdue' ? 'text-red-600' : 'text-amber-600'}`}>{invoice.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To section */}
      <div className="px-8 py-5 border-b border-slate-200 bg-slate-50">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Invoice To:</h3>
            <p className="font-bold text-slate-800">{invoice.customerName}</p>
            {invoice.customerPhone && <p className="text-xs text-slate-600 mt-0.5">📞 {invoice.customerPhone}</p>}
            {invoice.customerEmail && <p className="text-xs text-slate-600 mt-0.5">✉ {invoice.customerEmail}</p>}
            {invoice.customerAddress && <p className="text-xs text-slate-500 mt-0.5 whitespace-pre-wrap">{invoice.customerAddress}</p>}
            {invoice.customerGST && <p className="text-xs text-slate-600 mt-0.5">GST: <strong>{invoice.customerGST}</strong></p>}
          </div>
          <div>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business Category:</h3>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase">{invoice.businessType}</span>
          </div>
        </div>
      </div>

      {/* Category-specific extra fields */}
      {invoice.extraFields && Object.keys(invoice.extraFields || {}).some(k => invoice.extraFields[k]) && (
        <div className="px-8 py-3">
          {renderExtraAttributes()}
        </div>
      )}

      {/* Items Table */}
      <div className="px-8 py-4">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="py-2.5 px-3 text-center font-bold border border-blue-800 w-10">S.No</th>
              <th className="py-2.5 px-3 text-left font-bold border border-blue-800">Description / Service</th>
              <th className="py-2.5 px-3 text-center font-bold border border-blue-800 w-14">Qty</th>
              <th className="py-2.5 px-3 text-center font-bold border border-blue-800 w-16">Unit</th>
              <th className="py-2.5 px-3 text-right font-bold border border-blue-800 w-20">Rate (₹)</th>
              <th className="py-2.5 px-3 text-right font-bold border border-blue-800 w-16">GST %</th>
              <th className="py-2.5 px-3 text-right font-bold border border-blue-800 w-20">Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                <td className="py-2.5 px-3 text-center border border-slate-200">{index + 1}</td>
                <td className="py-2.5 px-3 border border-slate-200">
                  <span className="font-semibold text-slate-800">{item.name}</span>
                  {item.hsn && <span className="block text-[9px] text-slate-400 mt-0.5">HSN: {item.hsn}</span>}
                </td>
                <td className="py-2.5 px-3 text-center border border-slate-200">{item.quantity}</td>
                <td className="py-2.5 px-3 text-center border border-slate-200 text-slate-500">{item.unit || 'pcs'}</td>
                <td className="py-2.5 px-3 text-right border border-slate-200">{Number(item.price).toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right border border-slate-200">{item.gst}%</td>
                <td className="py-2.5 px-3 text-right border border-slate-200 font-bold">{Number(item.total).toFixed(2)}</td>
              </tr>
            ))}
            {/* Empty rows for short invoices */}
            {invoice.items.length < 3 && Array.from({ length: 3 - invoice.items.length }).map((_, i) => (
              <tr key={`empty-${i}`} className="bg-white">
                <td className="py-3 px-3 border border-slate-200 text-slate-300">{invoice.items.length + i + 1}</td>
                <td className="py-3 px-3 border border-slate-200" />
                <td className="py-3 px-3 border border-slate-200" />
                <td className="py-3 px-3 border border-slate-200" />
                <td className="py-3 px-3 border border-slate-200" />
                <td className="py-3 px-3 border border-slate-200" />
                <td className="py-3 px-3 border border-slate-200" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Info + Totals */}
      <div className="px-8 pb-6 grid grid-cols-2 gap-8">
        {/* Payment Info */}
        <div className="text-xs">
          <h3 className="font-bold text-slate-700 mb-2 text-[10px] uppercase tracking-widest">Payment Info:</h3>
          {biz.bankAccount ? (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
              <p><span className="font-bold text-slate-600">Account No:</span> {biz.bankAccount}</p>
              <p><span className="font-bold text-slate-600">Bank Name:</span> {biz.bankName}</p>
              <p><span className="font-bold text-slate-600">IFSC Code:</span> {biz.bankIfsc}</p>
            </div>
          ) : (
            <p className="text-slate-400 italic text-[10px]">No bank details configured.</p>
          )}

          <div className="mt-4 text-xs">
            <h3 className="font-bold text-slate-700 mb-1.5 text-[10px] uppercase tracking-widest">Address:</h3>
            <p className="text-slate-600 whitespace-pre-wrap">{biz.address}</p>
            <p className="text-slate-600 mt-1">Phone: {biz.phone}</p>
            <p className="text-slate-600">Email: {biz.email}</p>
          </div>
        </div>

        {/* Totals */}
        <div>
          <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden text-xs">
            <div className="flex justify-between px-4 py-2 border-b border-slate-200">
              <span className="text-slate-600 font-semibold">Sub Total:</span>
              <span className="font-bold">₹{Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between px-4 py-2 border-b border-slate-200">
              <span className="text-slate-600 font-semibold">GST (18%):</span>
              <span className="font-bold">₹{Number(invoice.gstTotal).toFixed(2)}</span>
            </div>
            {invoice.businessType === 'construction' && getExtraVal('loadingCharges') && (
              <div className="flex justify-between px-4 py-2 border-b border-slate-200">
                <span className="text-slate-600 font-semibold">Loading Charges:</span>
                <span className="font-bold">₹{parseFloat(getExtraVal('loadingCharges')).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3 bg-blue-700 text-white">
              <span className="font-bold text-sm">Total:</span>
              <span className="font-black text-lg">₹{Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Signature */}
      <div className="px-8 pb-6 flex justify-between items-end border-t border-slate-200 pt-6">
        <div className="text-xs text-slate-500">
          <p className="font-bold text-slate-700 mb-1">Description / Notes:</p>
          <p>Thank you for your business. Payment due within 30 days.</p>
          <p className="mt-2 font-bold text-slate-600">Note: This is a computer-generated invoice and does not require a physical signature.</p>
        </div>

        {/* Signature Block */}
        <div className="text-center w-52">
          <p className="text-xs text-slate-500 mb-1">For {biz.name}</p>
          {biz.signature ? (
            <img src={biz.signature} alt="Authorized Signature" className="max-h-14 object-contain mx-auto mb-1" />
          ) : (
            <div className="h-12" />
          )}
          <div className="border-t border-slate-700 pt-1">
            <p className="text-xs font-bold text-slate-800">Authorized Signatory</p>
            {biz.signatoryName && <p className="text-[10px] text-slate-500">({biz.signatoryName})</p>}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-blue-700 h-1.5 w-full" />
    </div>
  );
};

const InvoiceDetailModalWrapper = (props) => {
  const { onClose } = props;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-700/50 animate-fade-in">
        
        {/* Modal Controls */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md z-10 font-sans shrink-0">
          <div>
            <h2 className="text-xl font-bold">Invoice Preview</h2>
            <p className="text-slate-400 text-xs mt-0.5">Review, print or mark as paid</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={props.handlePrint || window.print}
              className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition cursor-pointer font-sans border border-slate-700"
            >
              <Printer size={14} />
              <span>Print / PDF</span>
            </button>
            
            {props.invoice.status !== 'Paid' && (
              <button
                onClick={() => props.onRecordPayment(props.invoice)}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs transition cursor-pointer font-sans"
              >
                <CreditCard size={14} />
                <span>Mark Paid</span>
              </button>
            )}

            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable invoice viewport */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-950/40">
          <div ref={props.printRef}>
            {props.children}
          </div>
        </div>

      </div>
    </div>
  );
};

const InvoiceDetailModal = (props) => {
  const printRef = useRef();
  
  const handlePrintLocal = () => {
    const printContent = printRef.current.innerHTML;
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(tag => tag.outerHTML)
      .join('\n');

    doc.write(`
      <html>
        <head>
          <title>Invoice - ${props.invoice.invoiceNumber}</title>
          ${styles}
          <style>
            @media print {
              body { font-size: 11px !important; color: #000 !important; background: #fff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            }
          </style>
        </head>
        <body class="bg-white text-black">
          ${printContent}
        </body>
      </html>
    `);
    doc.close();
    
    iframe.contentWindow.focus();
    setTimeout(() => {
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  };

  return createPortal(
    <InvoiceDetailModalWrapper {...props} printRef={printRef} handlePrint={handlePrintLocal}>
      <InvoiceTemplateRenderer {...props} />
    </InvoiceDetailModalWrapper>,
    document.body
  );
};

export { InvoiceTemplateRenderer };
export default InvoiceDetailModal;
