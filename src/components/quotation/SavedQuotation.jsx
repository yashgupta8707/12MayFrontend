import React, { useState, useEffect, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { FileText, ChevronDown, ChevronUp, Printer, Copy, Trash2, ExternalLink, GitBranch, Calendar, Clock } from 'lucide-react';

const SavedQuotations = ({ setSuccessMessage, setErrorMessage }) => {
  const { 
    savedQuotations, 
    loadingSaved, 
    loadPartyQuotations,
    loadQuotation,
    createRevision,
    selectedParty,
    togglePrintMode,
    currentQuotationId,
    isRevision,
    revisionNumber,
    revisionOf,
    generateQuotationName, // Use this function from context instead
    saveQuotation
  } = useQuotation();
  
  const [showQuotations, setShowQuotations] = useState(false);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [creatingRevision, setCreatingRevision] = useState(false);
  const [processingQuotationId, setProcessingQuotationId] = useState(null);
  
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
  }, [selectedParty?._id, showQuotations, loadPartyQuotations]); 
  
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
      setProcessingQuotationId(quotationId);
      await loadQuotation(quotationId);
      setSuccessMessage('Quotation loaded successfully');
      return true; // Return success for promise chaining
    } catch (error) {
      setErrorMessage(`Failed to load quotation: ${error.message}`);
      return false;
    } finally {
      setLoadingQuotation(false);
      setProcessingQuotationId(null);
    }
  };
  
  // Handle creating a revision with the new naming convention
  const handleCreateRevision = async (quotationId) => {
    try {
      setCreatingRevision(true);
      setProcessingQuotationId(quotationId);
      
      const revision = await createRevision(quotationId);
      setSuccessMessage(`Revision created successfully!`);
      
      // Reload the quotations list
      if (selectedParty && selectedParty._id) {
        await loadPartyQuotations(selectedParty._id);
      }
      
      return true;
    } catch (error) {
      setErrorMessage(`Failed to create revision: ${error.message}`);
      return false;
    } finally {
      setCreatingRevision(false);
      setProcessingQuotationId(null);
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
  
  // Organize quotations to show revisions properly
  const organizeQuotations = (quotations) => {
    if (!Array.isArray(quotations) || quotations.length === 0) {
      return [];
    }
    
    // Sort by date (newest first)
    return [...quotations].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });
  };
  
  const organizedQuotations = organizeQuotations(savedQuotations);
  
  // Get the formatted quotation title - FIXED VERSION
  const getFormattedQuotationName = (quotation) => {
    // If the title already exists and starts with "quote-", use it
    if (quotation.title && typeof quotation.title === 'string' && quotation.title.startsWith('quote-')) {
      return quotation.title;
    }
    
    // If quotation number exists and starts with "quote-", use it
    if (quotation.quotation_number && typeof quotation.quotation_number === 'string' && 
        quotation.quotation_number.startsWith('quote-')) {
      return quotation.quotation_number;
    }
    
    // Extract partyId safely, ensuring it exists and is a string
    let partyId = '';
    
    // Try to get party ID from different possible sources
    if (quotation.party_id) {
      if (typeof quotation.party_id === 'string') {
        partyId = quotation.party_id;
      } else if (quotation.party_id._id && typeof quotation.party_id._id === 'string') {
        partyId = quotation.party_id._id;
      }
    } else if (quotation.party && quotation.party._id && typeof quotation.party._id === 'string') {
      partyId = quotation.party._id;
    } else if (selectedParty && selectedParty._id && typeof selectedParty._id === 'string') {
      partyId = selectedParty._id;
    }
    
    // Safely get a shortened version of the party ID
    let shortPartyId = 'unknown';
    if (partyId && typeof partyId === 'string') {
      shortPartyId = partyId.substring(0, Math.min(8, partyId.length));
    }
    
    // Determine version
    let version = 1;
    if (quotation.revision_number) {
      version = quotation.revision_number;
    }
    
    return `quote-${shortPartyId}-${version}`;
  };
  
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
          ) : !Array.isArray(organizedQuotations) || organizedQuotations.length === 0 ? (
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
                      Quotation
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Valid Until
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
                  {organizedQuotations.map((quotation) => {
                    // Try-catch to prevent any errors in rendering
                    let formattedName;
                    try {
                      formattedName = getFormattedQuotationName(quotation);
                    } catch (error) {
                      console.error("Error formatting quotation name:", error);
                      formattedName = `Quotation ${quotation._id?.substring(0, 6) || "Unknown"}`;
                    }
                    
                    return (
                      <tr key={quotation._id} className={`hover:bg-gray-750 ${
                        quotation._id === currentQuotationId ? 'bg-blue-900 bg-opacity-30' : ''
                      }`}>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="font-medium text-white">
                              {formattedName}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-300">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                            {formatDate(quotation.date)}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-300">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-gray-500" />
                            {formatDate(quotation.valid_until)}
                          </div>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(quotation.status)}`}>
                            {quotation.status ? (quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)) : 'Draft'}
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
                              disabled={loadingQuotation || creatingRevision}
                              className={`text-blue-500 hover:text-blue-400 ${
                                processingQuotationId === quotation._id ? 'opacity-50' : ''
                              }`}
                              title="Load"
                            >
                              {processingQuotationId === quotation._id && loadingQuotation ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                              ) : (
                                <ExternalLink className="h-5 w-5" />
                              )}
                            </button>
                            <button
                              onClick={() => handlePrintQuotation(quotation._id)}
                              disabled={loadingQuotation || creatingRevision}
                              className="text-green-500 hover:text-green-400"
                              title="Print"
                            >
                              <Printer className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleCreateRevision(quotation._id)}
                              disabled={loadingQuotation || creatingRevision}
                              className={`text-purple-500 hover:text-purple-400 ${
                                processingQuotationId === quotation._id ? 'opacity-50' : ''
                              }`}
                              title="Create Revision"
                            >
                              {processingQuotationId === quotation._id && creatingRevision ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                              ) : (
                                <GitBranch className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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