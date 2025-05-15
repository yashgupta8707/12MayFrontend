import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Calendar,
  Search,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import StatsCard from "../components/quotation/StatsCard";

const Dashboard = () => {
  // State for storing all data
  const [parties, setParties] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for UI interactions
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState(null);
  const [expandedParty, setExpandedParty] = useState(null);
  const [timeRange, setTimeRange] = useState("all"); // 'all', 'week', 'month', 'year'

  // Fetch all necessary data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch parties
        const partiesResponse = await fetch(
          "https://server12may.onrender.com/api/parties",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!partiesResponse.ok) {
          throw new Error(`Failed to fetch parties: ${partiesResponse.status}`);
        }

        const partiesData = await partiesResponse.json();

        // Fetch all quotations
        const quotationsResponse = await fetch(
          "https://server12may.onrender.com/api/quotations",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (!quotationsResponse.ok) {
          throw new Error(
            `Failed to fetch quotations: ${quotationsResponse.status}`
          );
        }

        const quotationsData = await quotationsResponse.json();

        // Set data in state
        setParties(Array.isArray(partiesData) ? partiesData : []);
        setQuotations(Array.isArray(quotationsData) ? quotationsData : []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate summary statistics
  const getTotalSales = () => {
    return quotations.reduce(
      (sum, quote) => sum + (quote.total_amount || 0),
      0
    );
  };

  const getRecentQuotations = () => {
    // Sort by date descending and get the first 5
    return [...quotations]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const getFilteredParties = () => {
    if (!searchTerm.trim()) return parties;

    return parties.filter(
      (party) =>
        (party.name &&
          party.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (party.phone && party.phone.includes(searchTerm)) ||
        (party.address &&
          party.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getQuotationsForParty = (partyId) => {
    return quotations.filter(
      (quote) => quote.party && quote.party._id === partyId
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Toggle expanded state for a party
  const togglePartyExpand = (partyId) => {
    if (expandedParty === partyId) {
      setExpandedParty(null);
    } else {
      setExpandedParty(partyId);
    }
  };

  // Handle selecting a party for detailed view
  const handleSelectParty = (party) => {
    setSelectedParty(party);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Parties"
          value={parties.length}
          icon={<Users />}
          color="orange"
        />

        <StatsCard
          title="Total Quotations"
          value={quotations.length}
          icon={<FileText />}
          color="blue"
        />

        <StatsCard
          title="Total Sales Value"
          value={formatCurrency(getTotalSales())}
          icon={<CreditCard />}
          color="green"
        />

        <StatsCard
          title="Avg. Value Per Quotation"
          value={
            quotations.length > 0
              ? formatCurrency(getTotalSales() / quotations.length)
              : formatCurrency(0)
          }
          icon={<TrendingUp />}
          color="purple"
        />
      </div> */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          EmpressPC Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total Parties</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {parties.length}
                </h2>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total Quotations</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {quotations.length}
                </h2>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">Total Sales Value</p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {formatCurrency(getTotalSales())}
                </h2>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 text-sm">
                  Avg. Value Per Quotation
                </p>
                <h2 className="text-3xl font-bold text-gray-800">
                  {quotations.length > 0
                    ? formatCurrency(getTotalSales() / quotations.length)
                    : formatCurrency(0)}
                </h2>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Party List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  All Parties
                </h2>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search parties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {getFilteredParties().length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No parties found
                  </div>
                ) : (
                  getFilteredParties().map((party) => {
                    const partyQuotations = getQuotationsForParty(party._id);
                    const isExpanded = expandedParty === party._id;

                    return (
                      <div key={party._id} className="hover:bg-gray-50">
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => togglePartyExpand(party._id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {party.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {party.phone}
                              </p>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {partyQuotations.length} Quotes
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 ml-2 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 ml-2 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Address:</span>{" "}
                              {party.address || "N/A"}
                            </p>
                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Recent Quotations:
                              </h4>
                              {partyQuotations.length > 0 ? (
                                <ul className="space-y-2">
                                  {partyQuotations.slice(0, 3).map((quote) => (
                                    <li key={quote._id} className="text-sm">
                                      <Link
                                        to={`/quotations/${party._id}`}
                                        className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded"
                                      >
                                        <span>
                                          {quote.quotation_number || "Draft"}
                                        </span>
                                        <span className="text-gray-600">
                                          {formatDate(quote.date)}
                                        </span>
                                        <span className="font-medium text-green-600">
                                          {formatCurrency(quote.total_amount)}
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-500">
                                  No quotations yet
                                </p>
                              )}

                              {partyQuotations.length > 3 && (
                                <div className="mt-2 text-right">
                                  <button
                                    onClick={() => handleSelectParty(party)}
                                    className="text-sm text-orange-600 hover:text-orange-700"
                                  >
                                    View all {partyQuotations.length} quotations
                                  </button>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex space-x-2">
                              <Link
                                to={`/quotations/${party._id}`}
                                className="text-sm bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                              >
                                Create Quotation
                              </Link>
                              <Link
                                to={`/parties`}
                                className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                              >
                                Edit Party
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Selected Party Details or Recent Quotations */}
          <div className="lg:col-span-2">
            {selectedParty ? (
              // Selected Party Detailed View
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {selectedParty.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedParty.phone}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedParty(null)}
                    className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                  >
                    Back to Overview
                  </button>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Contact Information
                      </h3>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <p className="flex items-center text-gray-700">
                          <User className="h-4 w-4 mr-2 text-gray-500" />
                          {selectedParty.name}
                        </p>
                        <p className="flex items-center text-gray-700 mt-2">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {selectedParty.phone}
                        </p>
                        {selectedParty.address && (
                          <p className="flex items-start text-gray-700 mt-2">
                            <MapPin className="h-4 w-4 mr-2 text-gray-500 mt-1" />
                            <span>{selectedParty.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Quotation Summary
                      </h3>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">
                            Total Quotations:
                          </span>
                          <span className="font-medium text-gray-800">
                            {getQuotationsForParty(selectedParty._id).length}
                          </span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Total Value:</span>
                          <span className="font-medium text-gray-800">
                            {formatCurrency(
                              getQuotationsForParty(selectedParty._id).reduce(
                                (sum, q) => sum + (q.total_amount || 0),
                                0
                              )
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Latest Quotation:
                          </span>
                          <span className="font-medium text-gray-800">
                            {getQuotationsForParty(selectedParty._id).length > 0
                              ? formatDate(
                                  getQuotationsForParty(selectedParty._id).sort(
                                    (a, b) =>
                                      new Date(b.date) - new Date(a.date)
                                  )[0].date
                                )
                              : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    All Quotations
                  </h3>

                  {getQuotationsForParty(selectedParty._id).length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        No quotations found for this party
                      </p>
                      <Link
                        to={`/quotations/${selectedParty._id}`}
                        className="mt-3 inline-block bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
                      >
                        Create First Quotation
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quotation #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Valid Until
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getQuotationsForParty(selectedParty._id)
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((quotation) => (
                              <tr
                                key={quotation._id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {quotation.quotation_number || "Draft"}
                                  </div>
                                  {quotation.title && (
                                    <div className="text-xs text-gray-500">
                                      {quotation.title}
                                    </div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(quotation.date)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {formatDate(quotation.valid_until)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${
                                      quotation.status === "draft"
                                        ? "bg-gray-100 text-gray-800"
                                        : quotation.status === "sent"
                                        ? "bg-blue-100 text-blue-800"
                                        : quotation.status === "accepted"
                                        ? "bg-green-100 text-green-800"
                                        : quotation.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {quotation.status?.charAt(0).toUpperCase() +
                                      quotation.status?.slice(1) || "Draft"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                  {formatCurrency(quotation.total_amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <Link
                                      to={`/quotations/${selectedParty._id}?id=${quotation._id}`}
                                      className="text-orange-600 hover:text-orange-900"
                                    >
                                      View
                                    </Link>
                                    <button
                                      onClick={() => {
                                        /* handle print logic */
                                      }}
                                      className="text-blue-600 hover:text-blue-900"
                                    >
                                      Print
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
              </div>
            ) : (
              // Recent Activity
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Recent Quotations
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {getRecentQuotations().length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No quotations yet</p>
                    </div>
                  ) : (
                    getRecentQuotations().map((quotation) => (
                      <div key={quotation._id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {quotation.quotation_number || "Draft"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {quotation.title}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {quotation.party?.name || "Unknown Party"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(quotation.total_amount)}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
                              <Calendar className="h-3 w-3 mr-1" />{" "}
                              {formatDate(quotation.date)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              quotation.status === "draft"
                                ? "bg-gray-100 text-gray-800"
                                : quotation.status === "sent"
                                ? "bg-blue-100 text-blue-800"
                                : quotation.status === "accepted"
                                ? "bg-green-100 text-green-800"
                                : quotation.status === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {quotation.status?.charAt(0).toUpperCase() +
                              quotation.status?.slice(1) || "Draft"}
                          </span>

                          <div className="flex space-x-2">
                            <Link
                              to={`/quotations/${quotation.party?._id}?id=${quotation._id}`}
                              className="text-orange-600 hover:text-orange-900 text-sm"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => {
                                /* handle print logic */
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Print
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <Link
                    to="/quotations"
                    className="text-orange-600 hover:text-orange-900 font-medium"
                  >
                    View All Quotations
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
