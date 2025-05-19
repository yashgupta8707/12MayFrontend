import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaSearch, FaEye, FaPrint, FaEdit } from 'react-icons/fa';

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [filteredQuotations, setFilteredQuotations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all quotations when component mounts
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://server12may.onrender.com/api/quotations');
        // Make sure we're handling the response properly
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('Fetched quotations:', data);
        setQuotations(data);
        setFilteredQuotations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch quotations');
        setLoading(false);
        console.error('Error fetching quotations:', err);
      }
    };

    fetchQuotations();
  }, []);

  // Filter quotations based on search term
  useEffect(() => {
    if (!Array.isArray(quotations)) {
      console.error('quotations is not an array:', quotations);
      setFilteredQuotations([]);
      return;
    }
    
    if (searchTerm.trim() === '') {
      setFilteredQuotations(quotations);
    } else {
      const filtered = quotations.filter(
        (quotation) =>
          quotation?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quotation?.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quotation?.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quotation?.customerPhone?.includes(searchTerm)
      );
      setFilteredQuotations(filtered);
    }
  }, [searchTerm, quotations]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'converted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading quotations...</div>;
  
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">All Quotations</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
            placeholder="Search by customer name, quotation number, email or phone..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* Quotations List */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          {filteredQuotations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm ? 'No quotations match your search criteria' : 'No quotations found'}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotation #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{quotation.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{quotation.party_id.name}</div>
                      <div className="text-sm text-gray-500">{quotation.customerEmail}</div>
                      <div className="text-sm text-gray-500">{quotation.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(quotation.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{quotation.total_amount?.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{quotation.total_amount?.toLocaleString('en-IN')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(quotation.status)}`}>
                        {quotation.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <Link to={`/quotations/${quotation._id}`} className="text-blue-600 hover:text-blue-900" title="View">
                          <FaEye />
                        </Link>
                        <Link to={`/quotations/${quotation._id}/edit`} className="text-green-600 hover:text-green-900" title="Edit">
                          <FaEdit />
                        </Link>
                        <Link to={`/quotations/${quotation._id}/print`} className="text-gray-600 hover:text-gray-900" title="Print">
                          <FaPrint />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationsPage;