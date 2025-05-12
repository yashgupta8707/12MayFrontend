import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Calculator, Save, Printer, FileText, AlertTriangle, GitBranch, Info } from 'lucide-react';

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
    togglePrintMode,
    currentQuotationId,
    isRevision,
    revisionNumber,
    revisionOf,
    createRevision
  } = useQuotation();
  
  const [savingQuotation, setSavingQuotation] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [creatingRevision, setCreatingRevision] = useState(false);
  
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
      
      // Save the quotation
      const savedQuotation = await saveQuotation();
      
      setSuccessMessage(`Quotation ${savedQuotation.quotation_number || 'draft'} saved successfully!`);
    } catch (error) {
      setErrorMessage(`Failed to save quotation: ${error.message}`);
    } finally {
      setSavingQuotation(false);
    }
  };
  
  // Handle create revision
  const handleCreateRevision = async () => {
    if (!currentQuotationId) {
      setErrorMessage('Please save this quotation first before creating a revision');
      return;
    }
    
    try {
      setCreatingRevision(true);
      
      const revision = await createRevision(currentQuotationId);
      
      setSuccessMessage(`Revision ${revision.revision_number || 1} created successfully!`);
    } catch (error) {
      setErrorMessage(`Failed to create revision: ${error.message}`);
    } finally {
      setCreatingRevision(false);
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
        
        {/* Revision indicator */}
        {isRevision && (
          <div className="px-2 py-1 bg-purple-600 rounded-md text-white text-sm flex items-center">
            <GitBranch className="h-4 w-4 mr-1" />
            Revision {revisionNumber}
          </div>
        )}
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
      
      {/* Current quotation status */}
      {currentQuotationId && (
        <div className="bg-blue-900 bg-opacity-20 p-3 rounded-lg border border-blue-800 mb-4 flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-blue-200 text-sm">
            <p className="font-medium">Currently Editing: {isRevision ? `Revision ${revisionNumber}` : 'Original Quote'}</p>
            <p className="mt-1">You can save changes to this quotation or create a new revision.</p>
          </div>
        </div>
      )}
      
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
      <div className="flex flex-col space-y-3">
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
        
        {/* Create revision button */}
        {currentQuotationId && (
          <button
            onClick={handleCreateRevision}
            disabled={creatingRevision || items.length === 0 || !selectedParty}
            className={`flex items-center justify-center px-4 py-2 rounded-lg text-white font-medium ${
              creatingRevision || items.length === 0 || !selectedParty
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {creatingRevision ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Revision...
              </>
            ) : (
              <>
                <GitBranch className="h-5 w-5 mr-2" />
                Create New Revision
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuotationSummary;