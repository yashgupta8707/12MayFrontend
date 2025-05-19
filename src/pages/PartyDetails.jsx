import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { User, Phone, MapPin, FileText, CreditCard, Calendar, ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Edit, Trash2, Plus, Printer } from 'lucide-react';

const PartyDetails = () => {
  const { partyId } = useParams();
  const navigate = useNavigate();
  
  // State for party and quotations data
  const [party, setParty] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'month', 'year'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'amount', 'status'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [expandedQuotation, setExpandedQuotation] = useState(null);
  
  // Fetch data
  useEffect(() => {
    const fetchPartyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch party details
        const partyResponse = await fetch(`https://server12may.onrender.com/api/parties/${partyId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!partyResponse.ok) {
          throw new Error(`Failed to fetch party: ${partyResponse.status}`);
        }
        
        const partyData = await partyResponse.json();
        
        // Fetch quotations for this party
        const quotationsResponse = await fetch(`https://server12may.onrender.com/api/quotations/party/${partyId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!quotationsResponse.ok) {
          throw new Error(`Failed to fetch quotations: ${quotationsResponse.status}`);
        }
        
        const quotationsData = await quotationsResponse.json();
        
        // Set data in state
        setParty(partyData);
        setQuotations(Array.isArray(quotationsData) ? quotationsData : []);
      } catch (err) {
        console.error('Error fetching party data:', err);
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    
    if (partyId) {
      fetchPartyData();
    }
  }, [partyId]);
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to desc
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Toggle quotation expansion
  const toggleQuotationExpand = (quotationId) => {
    if (expandedQuotation === quotationId) {
      setExpandedQuotation(null);
    } else {
      setExpandedQuotation(quotationId);
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };
  
  // Get filtered and sorted quotations
  const getFilteredQuotations = () => {
    let filtered = [...quotations];
    
    // Apply time filter
    if (timeFilter === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter(q => new Date(q.date) >= oneMonthAgo);
    } else if (timeFilter === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      filtered = filtered.filter(q => new Date(q.date) >= oneYearAgo);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortBy === 'amount') {
        return sortDirection === 'asc'
          ? (a.total_amount || 0) - (b.total_amount || 0)
          : (b.total_amount || 0) - (a.total_amount || 0);
      } else if (sortBy === 'status') {
        const statusOrder = { 'accepted': 1, 'sent': 2, 'draft': 3, 'rejected': 4, 'expired': 5 };
        const aValue = statusOrder[a.status] || 99;
        const bValue = statusOrder[b.status] || 99;
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    
    return filtered;
  };
  
  // Calculate statistics
  const getTotalQuotationsValue = () => {
    return quotations.reduce((sum, q) => sum + (q.total_amount || 0), 0);
  };
  
  const getAcceptedQuotationsValue = () => {
    return quotations
      .filter(q => q.status === 'accepted')
      .reduce((sum, q) => sum + (q.total_amount || 0), 0);
  };
  
  const getLatestQuotation = () => {
    if (quotations.length === 0) return null;
    return quotations.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };
  
  const getStatusCount = (status) => {
    return quotations.filter(q => q.status === status).length;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading party details...</p>
        </div>
      </div>
    );
  }
  
  if (error || !party) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Party</h2>
          <p className="text-gray-600 mb-4">{error || 'Party not found'}</p>
          <button
            onClick={() => navigate('/parties')}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
          >
            Back to Parties
          </button>
        </div>
      </div>
    );
  }
  
  const filteredQuotations = getFilteredQuotations();
  const latestQuotation = getLatestQuotation();
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Back button and header */}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Party Details</h1>
        </div>
        
        {/* Party information section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-2/3 p-6">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{party.name}</h2>
                <div className="flex space-x-2">
                  <Link
                    to={`/parties/edit/${partyId}`}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <Edit className="h-5 w-5 text-gray-600" />
                  </Link>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start">
                  <Phone className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="text-gray-800 font-medium">{party.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-800 font-medium">{party.address || 'N/A'}</p>
                  </div>
                </div>
                
                {party.partyId && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Party ID</p>
                      <p className="text-gray-800 font-medium">{party.partyId}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="text-gray-800 font-medium">{formatDate(party.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3 bg-gray-50 p-6 border-l border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quotation Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Quotations:</span>
                  <span className="text-gray-800 font-medium">{quotations.length}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Value:</span>
                  <span className="text-gray-800 font-medium">{formatCurrency(getTotalQuotationsValue())}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Accepted Value:</span>
                  <span className="text-green-600 font-medium">{formatCurrency(getAcceptedQuotationsValue())}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Latest Quotation:</span>
                  <span className="text-gray-800 font-medium">
                    {latestQuotation ? formatDate(latestQuotation.date) : 'N/A'}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-200 mt-3">
                  <div className="flex justify-center">
                    <Link
                      to={`/quotations/${partyId}`}
                      className="bg-orange-600 text-white px-4 py-2 rounded flex items-center hover:bg-orange-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Quotation
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quotations section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200 p-4 flex flex-wrap justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Quotations History</h2>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* Time filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
              
              {/* Sort options */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <div className="relative inline-block">
                  <select
                    value={`${sortBy}-${sortDirection}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSortBy(field);
                      setSortDirection(direction);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="date-desc">Date (Newest)</option>
                    <option value="date-asc">Date (Oldest)</option>
                    <option value="amount-desc">Amount (Highest)</option>
                    <option value="amount-asc">Amount (Lowest)</option>
                    <option value="status-asc">Status</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status summary */}
          <div className="bg-gray-50 p-4 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded border border-gray-200 text-center">
                <div className="text-xl font-bold text-gray-800">{getStatusCount('draft')}</div>
                <div className="text-sm text-gray-600">Draft</div>
              </div>
              
              <div className="bg-white p-3 rounded border border-gray-200 text-center">
                <div className="text-xl font-bold text-blue-600">{getStatusCount('sent')}</div>
                <div className="text-sm text-gray-600">Sent</div>
              </div>
              
              <div className="bg-white p-3 rounded border border-gray-200 text-center">
                <div className="text-xl font-bold text-green-600">{getStatusCount('accepted')}</div>
                <div className="text-sm text-gray-600">Accepted</div>
              </div>
              
              <div className="bg-white p-3 rounded border border-gray-200 text-center">
                <div className="text-xl font-bold text-red-600">
                  {getStatusCount('rejected') + getStatusCount('expired')}
                </div>
                <div className="text-sm text-gray-600">Rejected/Expired</div>
              </div>
            </div>
          </div>
          
          {/* Quotations list */}
          {filteredQuotations.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Quotations Found</h3>
              <p className="text-gray-600 mb-4">
                {timeFilter !== 'all'
                  ? `No quotations found in the selected time period.`
                  : `No quotations have been created for this party yet.`}
              </p>
              <Link
                to={`/quotations/${partyId}`}
                className="inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Create First Quotation
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredQuotations.map(quotation => (
                <div key={quotation._id} className="hover:bg-gray-50">
                  {/* Quotation summary row */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleQuotationExpand(quotation._id)}
                  >
                    <div className="flex flex-wrap justify-between items-center">
                      <div className="w-full md:w-auto mb-2 md:mb-0">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">
                              {quotation.quotation_number || 'Draft'}
                            </div>
                            {quotation.title && (
                              <div className="text-sm text-gray-600">{quotation.title}</div>
                            )}
                          </div>
                          <div className="ml-2">
                            {expandedQuotation === quotation._id ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{formatDate(quotation.date)}</span>
                        </div>
                        
                        <div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full 
                            ${quotation.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              quotation.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              quotation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              quotation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}
                          >
                            {quotation.status?.charAt(0).toUpperCase() + quotation.status?.slice(1) || 'Draft'}
                          </span>
                        </div>
                        
                        <div className="font-medium text-gray-900">
                          {formatCurrency(quotation.total_amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded details */}
                  {expandedQuotation === quotation._id && (
                    <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Quotation Date</p>
                          <p className="text-gray-800">{formatDate(quotation.date)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Valid Until</p>
                          <p className="text-gray-800">{formatDate(quotation.valid_until)}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Items Count</p>
                          <p className="text-gray-800">{quotation.items?.length || 0} items</p>
                        </div>
                      </div>
                      
                      {/* Quick item summary */}
                      {quotation.items && quotation.items.length > 0 && (
                        <div className="bg-white p-3 rounded border border-gray-200 mb-4">
                          <h4 className="text-sm font-medium text-gray-800 mb-2">Items:</h4>
                          <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                            {quotation.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  {item.quantity} × {item.brand} {item.model}
                                </span>
                                <span className="text-gray-900">{formatCurrency(item.sale_with_gst * item.quantity)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Notes & Terms */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        {quotation.notes && (
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-800 mb-1">Notes:</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{quotation.notes}</p>
                          </div>
                        )}
                        
                        {quotation.terms_conditions && (
                          <div className="bg-white p-3 rounded border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-800 mb-1">Terms & Conditions:</h4>
                            <p className="text-sm text-gray-700 whitespace-pre-line">{quotation.terms_conditions}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Actions */}
                      <div className="flex space-x-3 mt-4">
                        <Link
                          to={`/quotations/${partyId}?id=${quotation._id}`}
                          className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
                        >
                          Edit Quotation
                        </Link>
                        
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                        >
                          <Printer className="h-4 w-4 mr-1" />
                          Print
                        </button>
                        
                        <button
                          className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                        >
                          Create Revision
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartyDetails;