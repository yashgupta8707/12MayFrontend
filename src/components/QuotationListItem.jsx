// components/QuotationListItem.js
// This component is for rendering a single quotation in the list

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ExternalLink, Printer, GitBranch } from 'lucide-react';

const QuotationListItem = ({ 
  quotation, 
  isActive, 
  onLoad, 
  onPrint, 
  onCreateRevision,
  loading,
  processingId
}) => {
  const { 
    _id, 
    quotation_number, 
    title, 
    date, 
    valid_until, 
    status, 
    total_amount,
    revision_number
  } = quotation;
  
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
  
  // Determine if this item is currently being processed
  const isProcessing = processingId === _id;
  
  // Format the display name (using the new convention)
  const displayName = quotation_number || title || 'Draft';
  
  return (
    <tr className={`hover:bg-gray-750 ${isActive ? 'bg-blue-900 bg-opacity-30' : ''}`}>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center">
          <span className="font-medium text-white">
            {displayName}
          </span>
          {revision_number > 1 && (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-600 text-white ml-2">
              Rev {revision_number}
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-gray-300">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1 text-gray-500" />
          {formatDate(date)}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-gray-300">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1 text-gray-500" />
          {formatDate(valid_until)}
        </div>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(status)}`}>
          {status ? (status.charAt(0).toUpperCase() + status.slice(1)) : 'Draft'}
        </span>
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-green-400 font-medium">
        {total_amount !== undefined ? 
          `₹${Number(total_amount).toLocaleString()}` : 
          'N/A'}
      </td>
      <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onLoad(_id)}
            disabled={loading}
            className={`text-blue-500 hover:text-blue-400 ${
              isProcessing && loading ? 'opacity-50' : ''
            }`}
            title="Load"
          >
            {isProcessing && loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            ) : (
              <ExternalLink className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={() => onPrint(_id)}
            disabled={loading}
            className="text-green-500 hover:text-green-400"
            title="Print"
          >
            <Printer className="h-5 w-5" />
          </button>
          <button
            onClick={() => onCreateRevision(_id)}
            disabled={loading}
            className={`text-purple-500 hover:text-purple-400 ${
              isProcessing && !loading ? 'opacity-50' : ''
            }`}
            title="Create Revision"
          >
            {isProcessing && !loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
            ) : (
              <GitBranch className="h-5 w-5" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};

export default QuotationListItem;