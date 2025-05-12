import React, { useState } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Building2, Phone, Mail, FileText } from 'lucide-react';

const BusinessDetailsForm = () => {
  const { businessDetails, setBusinessDetails, quotationNumber, setQuotationNumber, quotationDate, setQuotationDate, validUntil, setValidUntil } = useQuotation();
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Format date for input field
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  // Handle business details change
  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle date change
  const handleDateChange = (e) => {
    setQuotationDate(new Date(e.target.value));
  };
  
  // Handle valid until date change
  const handleValidUntilChange = (e) => {
    setValidUntil(new Date(e.target.value));
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Building2 className="mr-2 h-5 w-5 text-orange-500" />
          Business & Quotation Details
        </h2>
        <button
          className={`px-3 py-1 rounded text-sm ${
            isEditing
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Save' : 'Edit'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Business Info */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Business Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={businessDetails.name}
                onChange={handleBusinessChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                {businessDetails.name}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
            {isEditing ? (
              <textarea
                name="address"
                value={businessDetails.address}
                onChange={handleBusinessChange}
                rows="3"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white min-h-[76px] whitespace-pre-line">
                {businessDetails.address}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <Phone className="inline h-4 w-4 mr-1" />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="phone"
                  value={businessDetails.phone}
                  onChange={handleBusinessChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                  {businessDetails.phone}
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-1">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={businessDetails.email}
                  onChange={handleBusinessChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              ) : (
                <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                  {businessDetails.email}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              <FileText className="inline h-4 w-4 mr-1" />
              GSTIN
            </label>
            {isEditing ? (
              <input
                type="text"
                name="gstin"
                value={businessDetails.gstin}
                onChange={handleBusinessChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                {businessDetails.gstin}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Quotation Info */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Quotation Number</label>
            <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white font-mono">
              {quotationNumber || 'Auto-generated when saved'}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
            {isEditing ? (
              <input
                type="date"
                value={formatDateForInput(quotationDate)}
                onChange={handleDateChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                {quotationDate.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Valid Until</label>
            {isEditing ? (
              <input
                type="date"
                value={formatDateForInput(validUntil)}
                onChange={handleValidUntilChange}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                {validUntil.toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Logo</label>
            {isEditing ? (
              <input
                type="text"
                name="logo"
                value={businessDetails.logo}
                onChange={handleBusinessChange}
                placeholder="Logo URL"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <div className="flex items-center justify-center bg-gray-700 border border-gray-600 rounded p-3 h-20">
                {businessDetails.logo ? (
                  <img
                    src={businessDetails.logo}
                    alt="Business Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-gray-500">No logo</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailsForm;