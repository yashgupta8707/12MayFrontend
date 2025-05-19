import React, { useState, useEffect } from 'react';
import { useQuotation } from '../context/QuotationContext';
import { Link } from 'react-router-dom';
import { FaSearch, FaEye, FaPrint, FaEdit, FaSpinner, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const AllQuotationsPage = () => {
  const { 
    allQuotations, 
    loadingAllQuotations, 
    fetchAllQuotations,
    loadQuotation,
    togglePrintMode
  } = useQuotation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [loadingQuotation, setLoadingQuotation] = useState(false);
  const [processingQuotationId, setProcessingQuotationId] = useState(null);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch all quotations on component mount
  useEffect(() => {
    fetchAllQuotations().catch(error => {
      setErrorMessage(`Failed to load quotations: ${error.message}`);
    });
  }, []);

  // Filter quotations based on search term
  useEffect(() => {
    if (!Array.isArray(allQuotations)) {
      setFilteredQuotations([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredQuotations(sortQuotations(allQuotations, sortField, sortDirection));
    } else {
      const filtered = allQuotations.filter(quotation => {
        // Get party name safely
        const partyName = quotation.party?.name || 'Unknown';
        
        // Search in multiple fields
        return (
          quotation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quotation.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quotation.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quotation.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      
      setFilteredQuotations(sortQuotations(filtered, sortField, sortDirection));
    }
  }, [allQuotations, searchTerm, sortField, sortDirection]);

  // Sort quotations
  const sortQuotations = (quotations, field, direction) => {
    if (!Array.isArray(quotations)) return [];
    
    return [...quotations].sort((a, b) => {
      let valueA, valueB;
      
      switch (field) {
        case 'date':
          valueA = new Date(a.date || 0).getTime();
          valueB = new Date(b.date || 0).getTime();
          break;
        case 'validUntil':
          valueA = new Date(a.valid_until || 0).getTime();
          valueB = new Date(b.valid_until || 0).getTime();
          break;
        case 'party':
          valueA = a.party?.name || '';
          valueB = b.party?.name || '';
          break;
        case 'totalAmount':
          valueA = Number(a.total_amount || 0);
          valueB = Number(b.total_amount || 0);
          break;
        case 'status':
          valueA = a.status || '';
          valueB = b.status || '';
          break;
        default:
          valueA = a[field] || '';
          valueB = b[field] || '';
      }
      
      // Handle string comparison
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return direction === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // Handle number comparison
      return direction === 'asc' ? valueA - valueB : valueB - valueA;
    });
  };

  // Handle sort click
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle loading a quotation
  const handleLoadQuotation = async (quotationId) => {
    try {
      setLoadingQuotation(true);
      setProcessingQuotationId(quotationId);
      await loadQuotation(quotationId);
      setSuccessMessage('Quotation loaded successfully');
      return true;
    } catch (error) {
      setErrorMessage(`Failed to load quotation: ${error.message}`);
      return false;
    } finally {
      setLoadingQuotation(false);
      setProcessingQuotationId(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
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
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
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

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <FaSortAmountUp className="ml-1 inline text-xs" /> 
      : <FaSortAmountDown className="ml-1 inline text-xs" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">All Quotations</h1>
        
        {/* Messages */}
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
            <p>{successMessage}</p>
          </div>
        )}
        
        {errorMessage && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{errorMessage}</p>
          </div>
        )}
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search by quotation number, party name, status..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button 
            onClick={() => fetchAllQuotations()}
            className="absolute right-2.5 top-2.5 text-blue-600 hover:text-blue-800"
            title="Refresh quotations"
          >
            {loadingAllQuotations ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Quotations List */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {loadingAllQuotations ? (
            <div className="p-6 text-center">
              <FaSpinner className="animate-spin mx-auto h-8 w-8 text-blue-500 mb-4" />
              <p>Loading quotations...</p>
            </div>
          ) : !Array.isArray(filteredQuotations) || filteredQuotations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No quotations match your search criteria' : 'No quotations found'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('quotation_number')}
                  >
                    <span className="flex items-center">
                      Quotation # {renderSortIndicator('quotation_number')}
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('party')}
                  >
                    <span className="flex items-center">
                      Party {renderSortIndicator('party')}
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <span className="flex items-center">
                      Date {renderSortIndicator('date')}
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('validUntil')}
                  >
                    <span className="flex items-center">
                      Valid Until {renderSortIndicator('validUntil')}
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <span className="flex items-center">
                      Status {renderSortIndicator('status')}
                    </span>
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <span className="flex items-center">
                      Total {renderSortIndicator('totalAmount')}
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quotation.quotation_number}</div>
                      {quotation.title && quotation.title !== quotation.quotation_number && (
                        <div className="text-xs text-gray-500">{quotation.title}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {quotation.party?.name || 'Unknown Party'}
                      </div>
                      {quotation.party?.email && (
                        <div className="text-xs text-gray-500">{quotation.party.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(quotation.date)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(quotation.valid_until)}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(quotation.status)}`}>
                        {quotation.status ? quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1) : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{Number(quotation.total_amount || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleLoadQuotation(quotation._id)}
                          disabled={loadingQuotation}
                          className={`text-blue-600 hover:text-blue-900 ${
                            processingQuotationId === quotation._id && loadingQuotation ? 'opacity-50' : ''
                          }`}
                          title="View"
                        >
                          {processingQuotationId === quotation._id && loadingQuotation ? (
                            <FaSpinner className="animate-spin h-5 w-5" />
                          ) : (
                            <FaEye className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handlePrintQuotation(quotation._id)}
                          disabled={loadingQuotation}
                          className="text-green-600 hover:text-green-900"
                          title="Print"
                        >
                          <FaPrint className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleLoadQuotation(quotation._id)}
                          disabled={loadingQuotation}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination could be added here */}
        
        {/* Quotation Count */}
        {Array.isArray(filteredQuotations) && filteredQuotations.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredQuotations.length} of {allQuotations.length} quotations
          </div>
        )}
      </div>
    </div>
  );
};

export default AllQuotationsPage;