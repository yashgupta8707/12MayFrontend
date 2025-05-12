import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Calculator, Save, Printer, FileText, AlertTriangle } from 'lucide-react';
import { debugFetch } from '../../utils/debugUtils';

const QuotationSummary = ({ setSuccessMessage, setErrorMessage }) => {
  const { 
    items, 
    calculateTotalPurchase, 
    calculateTotalSale, 
    calculateTotalTax, 
    calculateMargin,
    calculateMarginPercentage,
    selectedParty,
    notes,
    setNotes,
    terms,
    setTerms,
    saveQuotation,
    togglePrintMode
  } = useQuotation();
  
  const [savingQuotation, setSavingQuotation] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  
  // Total calculations
  const totalPurchase = calculateTotalPurchase();
  const totalSale = calculateTotalSale();
  const totalTax = calculateTotalTax();
  const totalMargin = calculateMargin();
  const marginPercentage = calculateMarginPercentage();
  
  // Handle save quotation
  const handleSaveQuotation = async () => {
    try {
      // Validate required data
      if (!selectedParty) {
        setErrorMessage('Please select a party before saving the quotation');
        return;
      }
      
      if (items.length === 0) {
        setErrorMessage('Please add at least one item to the quotation');
        return;
      }
      
      setSavingQuotation(true);
      
      // Custom implementation to debug the API request
      try {
        // Calculate totals on the client side
        const total_purchase = calculateTotalPurchase();
        const total_sale = calculateTotalSale();
        const total_tax = calculateTotalTax();

        // Validate and clean items data
        const validatedItems = items.map(item => ({
          category: item.category || '',
          brand: item.brand || '',
          model: item.model || '',
          hsn_sac: item.hsn_sac || '',
          warranty: item.warranty || '',
          quantity: Number(item.quantity) || 1,
          purchase_with_gst: Number(item.purchase_with_gst) || 0,
          sale_with_gst: Number(item.sale_with_gst) || 0,
          gst_percentage: Number(item.gst_percentage) || 18
        }));

        // Create quotation data
        const quotationData = {
          party_id: selectedParty._id,
          quotation_number: `QT-${Date.now().toString().slice(-6)}`, // Generate a temporary quotation number
          business_details: {
            name: "EmpressPC",
            address: "123 Tech Street, Lucknow, UP 226001",
            phone: "+91 9876543210",
            email: "contact@empresspc.in",
            gstin: "GSTIN1234567890",
            logo: "/logo.png"
          },
          items: validatedItems,
          total_amount: total_sale,
          total_purchase: total_purchase,
          total_tax: total_tax,
          notes: notes || '',
          terms_conditions: terms || '',
          status: 'draft'
        };

        console.log('Sending quotation data:', JSON.stringify(quotationData, null, 2));

        const response = await fetch('http://localhost:5000/api/quotations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(quotationData)
        });

        // Handle response
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to save quotation: ${response.status} ${response.statusText}`);
        }

        const savedQuotation = await response.json();
        console.log('Quotation saved successfully:', savedQuotation);
        
        setSuccessMessage(`Quotation ${savedQuotation.quotation_number || 'draft'} saved successfully!`);
      } catch (error) {
        console.error('Error in direct API call:', error);
        throw error;
      }
    } catch (error) {
      setErrorMessage(`Failed to save quotation: ${error.message}`);
    } finally {
      setSavingQuotation(false);
    }
  };
  
  // Handle print quotation
  const handlePrintQuotation = () => {
    if (!selectedParty) {
      setErrorMessage('Please select a party before printing the quotation');
      return;
    }
    
    if (items.length === 0) {
      setErrorMessage('Please add at least one item to the quotation');
      return;
    }
    
    togglePrintMode();
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Calculator className="mr-2 h-5 w-5 text-orange-500" />
          Quotation Summary
        </h2>
      </div>
      
      {/* Summary stats */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">Total Items</div>
            <div className="text-white text-xl font-semibold">{items.length}</div>
          </div>
          
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-gray-400 text-sm mb-1">Total Quantity</div>
            <div className="text-white text-xl font-semibold">
              {items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
            </div>
          </div>
        </div>
        
        {/* Purchase totals - only visible to admin */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Purchase Total (with GST)</div>
          <div className="text-white text-xl font-semibold">₹{totalPurchase.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
        </div>
        
        {/* Sales totals */}
        <div className="bg-blue-900 bg-opacity-40 p-3 rounded-lg border border-blue-800">
          <div className="text-blue-300 text-sm mb-1">Subtotal (without GST)</div>
          <div className="text-white text-xl font-semibold">
            ₹{(totalSale - totalTax).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-blue-900 bg-opacity-40 p-3 rounded-lg border border-blue-800">
          <div className="text-blue-300 text-sm mb-1">GST Amount</div>
          <div className="text-white text-xl font-semibold">
            ₹{totalTax.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        
        <div className="bg-green-900 bg-opacity-40 p-3 rounded-lg border border-green-800">
          <div className="text-green-300 text-sm mb-1">Grand Total (with GST)</div>
          <div className="text-white text-2xl font-bold">
            ₹{totalSale.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>
        
        {/* Margin - only visible to admin */}
        <div className="bg-gray-700 p-3 rounded-lg">
          <div className="text-gray-400 text-sm mb-1">Margin</div>
          <div className="flex justify-between">
            <div className="text-white text-xl font-semibold">
              ₹{totalMargin.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
            <div className={`text-lg font-medium ${
              marginPercentage >= 15 ? 'text-green-400' : 
              marginPercentage >= 10 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {marginPercentage.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Notes and Terms toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="w-full flex justify-between items-center bg-gray-700 hover:bg-gray-650 p-3 rounded-lg transition-colors"
        >
          <span className="text-gray-200 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {showNotes ? 'Hide Notes & Terms' : 'Show Notes & Terms'}
          </span>
          <span className="text-gray-400 text-sm">
            {showNotes ? '▲' : '▼'}
          </span>
        </button>
      </div>
      
      {/* Notes and Terms section */}
      {showNotes && (
        <div className="space-y-4 mb-6 animate-fadeIn">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes here..."
              rows="3"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Terms & Conditions</label>
            <textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Add your terms and conditions here..."
              rows="5"
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}
      
      {/* Warning if no items or party */}
      {(items.length === 0 || !selectedParty) && (
        <div className="bg-yellow-900 bg-opacity-30 border border-yellow-800 p-3 rounded-lg mb-4 flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-yellow-200 text-sm">
            {!selectedParty && <p>Please select a party for this quotation.</p>}
            {items.length === 0 && <p>Please add at least one item to the quotation.</p>}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleSaveQuotation}
          disabled={savingQuotation || items.length === 0 || !selectedParty}
          className={`flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium flex-1 ${
            savingQuotation || items.length === 0 || !selectedParty
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {savingQuotation ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Quotation
            </>
          )}
        </button>
        
        <button
          onClick={handlePrintQuotation}
          disabled={items.length === 0 || !selectedParty}
          className={`flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium flex-1 ${
            items.length === 0 || !selectedParty
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <Printer className="h-5 w-5 mr-2" />
          Print
        </button>
      </div>
    </div>
  );
};

export default QuotationSummary;