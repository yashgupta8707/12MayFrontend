import React, { useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Printer, X } from 'lucide-react';

const PrintMode = () => {
  const { 
    businessDetails, 
    selectedParty, 
    items, 
    quotationNumber, 
    quotationDate, 
    validUntil,
    notes,
    terms,
    togglePrintMode,
    calculateTotalSale,
    calculateTotalTax
  } = useQuotation();
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(date).toLocaleString('en-IN', options).replace(',', ',');
  };
  
  // Auto-print when component mounts
  useEffect(() => {
    // Add a small delay to ensure the component is fully rendered
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add CSS for print media to ensure strict one-page layout
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        @page { 
          size: A4; 
          margin: 0.5cm;
        }
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .page-container {
          width: 21cm;
          height: 29.7cm;
          overflow: hidden;
          position: relative;
          page-break-after: always;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Calculate subtotal (without GST)
  const subtotal = calculateTotalSale() - calculateTotalTax();
  
  // Calculate total
  const total = calculateTotalSale();
  
  // Calculate total tax
  const totalTax = calculateTotalTax();
  
  // Function to convert number to words - simplified version
  const numberToWords = (num) => {
    if (!num) return '';
    const units = num.toFixed(2).split('.');
    const amount = parseInt(units[0]);
    const paise = parseInt(units[1]);
    
    // This is a simplified version - for production, use a more comprehensive function
    return `${amount} Rupees and ${paise} Paisa only`;
  };
  
  return (
    <div className="bg-white text-gray-800 min-h-screen">
      {/* Print Controls - Not visible when printing */}
      <div className="no-print fixed top-4 right-4 flex space-x-4">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Printer className="mr-2 h-5 w-5" />
          Print
        </button>
        <button
          onClick={togglePrintMode}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <X className="mr-2 h-5 w-5" />
          Close
        </button>
      </div>
      
      {/* Quotation Document - strictly contained to one page */}
      <div className="max-w-4xl mx-auto bg-white shadow-sm print:shadow-none relative print:page-container p-3">
        {/* Title */}
        <div className="text-center mb-2">
          <h1 className="text-lg font-bold">Estimate</h1>
        </div>
        
        {/* Header with two columns */}
        <div className="flex mb-2 border border-gray-300 text-xs">
          {/* Company Information */}
          <div className="w-1/2 p-2 border-r border-gray-300">
            <div className="flex items-start">
              <div className="mr-2 flex-shrink-0">
                {businessDetails.logo ? (
                  <img 
                    src={businessDetails.logo} 
                    alt="Business Logo" 
                    className="h-12"
                  />
                ) : (
                  <div className="h-12 w-12 flex items-center justify-center bg-orange-500 text-white">
                    <span className="text-lg">E</span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-base font-bold">{businessDetails.name}</h2>
                <p className="leading-tight">{businessDetails.address}</p>
                <p className="leading-tight">Phone no.: {businessDetails.phone}</p>
                <p className="leading-tight">Email: {businessDetails.email}</p>
                <p className="leading-tight">GSTIN: {businessDetails.gstin}</p>
                <p className="leading-tight">State: 09-Uttar Pradesh</p>
              </div>
            </div>
          </div>
          
          {/* Quote Details */}
          <div className="w-1/2 p-2">
            <div className="grid grid-cols-2 gap-1">
              <div className="font-medium">Estimate No.</div>
              <div>{quotationNumber || 'EPC/E/2526/00210'}</div>
              
              <div className="font-medium">Date</div>
              <div>{formatDate(quotationDate)}</div>
              
              <div className="font-medium">Place of supply</div>
              <div>09-Uttar Pradesh</div>
            </div>
          </div>
        </div>
        
        {/* Customer Details */}
        <div className="mb-2 border border-gray-300 p-2 text-xs">
          <div className="font-medium">Estimate For</div>
          <div className="font-medium">{selectedParty?.name || 'Customer Name'}</div>
          <div className="flex justify-between">
            <div>{selectedParty?.address || 'Address'}</div>
            <div>Contact No.: {selectedParty?.phone || '9876543210'}</div>
          </div>
          <div>State: 09-Uttar Pradesh</div>
        </div>
        
        {/* Items Table without individual prices - Compact version */}
        <div className="mb-2">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-1 text-left">#</th>
                <th className="border border-gray-300 p-1 text-left">Item name</th>
                <th className="border border-gray-300 p-1 text-center w-16">HSN/SAC</th>
                <th className="border border-gray-300 p-1 text-center w-16">Qty</th>
                <th className="border border-gray-300 p-1 text-center w-12">Unit</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-1">{index + 1}</td>
                    <td className="border border-gray-300 p-1">
                      <div className="font-medium">{item.brand} {item.model}</div>
                      {item.category && <div className="text-xs text-gray-600">{item.category}</div>}
                    </td>
                    <td className="border border-gray-300 p-1 text-center">{item.hsn_sac}</td>
                    <td className="border border-gray-300 p-1 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 p-1 text-center">Pcs</td>
                  </tr>
                ))
              ) : (
                // Default item if no items exist
                <tr>
                  <td className="border border-gray-300 p-1">1</td>
                  <td className="border border-gray-300 p-1">
                    <div className="font-medium">Sample Product</div>
                  </td>
                  <td className="border border-gray-300 p-1 text-center">8473</td>
                  <td className="border border-gray-300 p-1 text-center">1</td>
                  <td className="border border-gray-300 p-1 text-center">Pcs</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Amount in words */}
        <div className="mb-2 border border-gray-300 p-1 text-xs">
          <div className="font-medium">Estimate Amount in Words</div>
          <div>{numberToWords(total)}</div>
        </div>
        
        {/* Total Summary - Combined Section */}
        <div className="mb-2 border border-gray-300 text-xs">
          <div className="p-1 font-medium">Amounts</div>
          <table className="w-full">
            <tbody>
              <tr>
                <td className="border-t border-gray-300 p-1">Sub Total (without GST)</td>
                <td className="border-t border-gray-300 p-1 text-right">₹{subtotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td className="border-t border-gray-300 p-1">Total GST</td>
                <td className="border-t border-gray-300 p-1 text-right">₹{totalTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
              <tr className="font-bold bg-gray-100">
                <td className="border-t border-gray-300 p-1">Total Amount</td>
                <td className="border-t border-gray-300 p-1 text-right">₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Bottom Section: Bank Details and Terms - More compact */}
        <div className="flex mb-2 text-xs">
          {/* Bank Details */}
          <div className="w-1/2 pr-1">
            <div className="border border-gray-300 p-1 h-full">
              <div className="font-medium mb-0.5">Bank Details</div>
              <p className="leading-tight">Name: KOTAK MAHINDRA BANK LIMITED</p>
              <p className="leading-tight">Account No.: 8707304202</p>
              <p className="leading-tight">IFSC code: KKBK0005194</p>
              <p className="leading-tight">Account holder's name: {businessDetails.name}</p>
            </div>
          </div>
          
          {/* Terms and Conditions */}
          <div className="w-1/2 pl-1">
            <div className="border border-gray-300 p-1 h-full">
              <div className="font-medium mb-0.5">Terms and conditions</div>
              <p className="leading-tight">{terms || '1. Quote Is Valid For 7 Days Only!'}</p>
            </div>
          </div>
        </div>
        
        {/* Signature */}
        <div className="flex justify-end mt-2 text-xs">
          <div className="text-center w-32">
            <div>For: {businessDetails.name}</div>
            <div className="mt-8 border-t border-gray-400">
              <p>Authorized Signatory</p>
            </div>
          </div>
        </div>
        
        {/* Watermark */}
        {businessDetails.logo && (
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
            <img 
              src={businessDetails.logo} 
              alt="Watermark" 
              className="w-1/2 max-w-md"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintMode;