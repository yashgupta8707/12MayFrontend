import React, { useState, useEffect, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { FileText, ChevronDown, ChevronUp, Printer, Copy, Trash2, ExternalLink } from 'lucide-react';

const SavedQuotations = ({ setSuccessMessage, setErrorMessage }) => {
  const { 
    savedQuotations, 
    loadingSaved, 
    loadSavedQuotations,
    loadQuotation,
    selectedParty,
    loadPartyQuotations,
    togglePrintMode 
  } = useQuotation();
  
  const [showQuotations, setShowQuotations] = useState(false);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  
  // Use refs to prevent infinite loops
  const partyIdRef = useRef(null);
  const hasLoadedRef = useRef(false);
  
  // Load saved quotations only when the component mounts, party changes, or when toggled
  useEffect(() => {
    // Only reload if we have a selected party and the section is visible
    if (selectedParty && selectedParty._id && showQuotations) {
      // Check if this party's quotations have already been loaded
      if (partyIdRef.current !== selectedParty._id || !hasLoadedRef.current) {
        console.log(`Loading quotations for party: ${selectedParty._id} (one-time)`);
        
        // Update our refs to prevent reloading
        partyIdRef.current = selectedParty._id;
        hasLoadedRef.current = true;
        
        // Load quotations
        loadPartyQuotations(selectedParty._id);
      }
    }
  }, [selectedParty?._id, showQuotations]); // Only depend on the ID and visibility
  
  // Toggle quotations visibility
  const toggleQuotations = () => {
    const newShowState = !showQuotations;
    setShowQuotations(newShowState);
    
    // If opening and we haven't loaded for this party yet, trigger load
    if (newShowState && selectedParty && selectedParty._id) {
      if (partyIdRef.current !== selectedParty._id || !hasLoadedRef.current) {
        console.log(`Loading quotations on toggle for party: ${selectedParty._id}`);
        partyIdRef.current = selectedParty._id;
        hasLoadedRef.current = true;
        loadPartyQuotations(selectedParty._id);
      }
    }
  };
  
  // Load a saved quotation
  const handleLoadQuotation = async (quotationId) => {
    try {
      setLoadingQuotation(true);
      await loadQuotation(quotationId);
      setSuccessMessage('Quotation loaded successfully');
      return true; // Return success for promise chaining
    } catch (error) {
      setErrorMessage(`Failed to load quotation: ${error.message}`);
      return false;
    } finally {
      setLoadingQuotation(false);
    }
  };
  
  // Handle print action
  const handlePrintQuotation = async (quotationId) => {
    const success = await handleLoadQuotation(quotationId);
    if (success) {
      togglePrintMode();
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-600 text-white';
      case 'sent':
        return 'bg-blue-600 text-white';
      case 'accepted':
        return 'bg-green-600 text-white';
      case 'rejected':
        return 'bg-red-600 text-white';
      case 'expired':
        return 'bg-yellow-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };
  
  // Reset loaded state when party changes
  useEffect(() => {
    if (selectedParty?._id !== partyIdRef.current) {
      hasLoadedRef.current = false;
    }
  }, [selectedParty?._id]);
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg shadow-lg mb-6">
      <button
        onClick={toggleQuotations}
        className="w-full flex justify-between items-center"
      >
        <div className="flex items-center">
          <FileText className="mr-2 h-5 w-5 text-orange-500" />
          <h2 className="text-xl font-semibold text-white">
            {selectedParty 
              ? `Saved Quotations for ${selectedParty.name}`
              : 'Saved Quotations'}
          </h2>
          {loadingSaved && (
            <div className="ml-3 animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          )}
        </div>
        {showQuotations ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      {showQuotations && (
        <div className="mt-4 animate-fadeIn">
          {loadingSaved ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="mt-2 text-gray-400">Loading quotations...</p>
            </div>
          ) : !Array.isArray(savedQuotations) || savedQuotations.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500">No saved quotations found</p>
              {selectedParty ? (
                <p className="text-gray-600 text-sm mt-1">
                  Create your first quotation for {selectedParty.name}
                </p>
              ) : (
                <p className="text-gray-600 text-sm mt-1">
                  Select a party to create a quotation
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Quotation #
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {savedQuotations.map((quotation) => (
                    <tr key={quotation._id} className="hover:bg-gray-750">
                      <td className="px-3 py-3 whitespace-nowrap font-medium text-white">
                        {quotation.quotation_number || 'No number'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-300">
                        {formatDate(quotation.date)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(quotation.status)}`}>
                          {quotation.status ? (quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-green-400 font-medium">
                        {quotation.total_amount !== undefined ? 
                          `₹${Number(quotation.total_amount).toLocaleString()}` : 
                          'N/A'}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleLoadQuotation(quotation._id)}
                            disabled={loadingQuotation}
                            className="text-blue-500 hover:text-blue-400"
                            title="Load"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePrintQuotation(quotation._id)}
                            disabled={loadingQuotation}
                            className="text-green-500 hover:text-green-400"
                            title="Print"
                          >
                            <Printer className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleLoadQuotation(quotation._id)}
                            disabled={loadingQuotation}
                            className="text-purple-500 hover:text-purple-400"
                            title="Copy"
                          >
                            <Copy className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedQuotations;