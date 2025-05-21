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
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  DollarSign,
  BarChart2,
  Filter,
  ShoppingBag,
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
  const [quotationSearchTerm, setQuotationSearchTerm] = useState("");
  const [selectedParty, setSelectedParty] = useState(null);
  const [expandedParty, setExpandedParty] = useState(null);
  const [timeRange, setTimeRange] = useState("all"); // 'all', 'week', 'month', 'year'
  const [filterModalOpen, setFilterModalOpen] = useState(false);

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

        // Process quotations to correctly associate with parties and calculate margins
        const processedQuotations = quotationsData.map((quotation) => {
          // Find the associated party
          const associatedParty = partiesData.find(
            (party) =>
              party._id ===
              (typeof quotation.party_id === "string"
                ? quotation.party_id
                : quotation.party_id?._id)
          );

          // Calculate margin for each quotation
          const totalPurchase = quotation.total_purchase || 0;
          const totalAmount = quotation.total_amount || 0;
          const margin = totalAmount - totalPurchase;

          return {
            ...quotation,
            party: associatedParty || quotation.party || null, // Attach the full party object
            margin: margin, // Add margin calculation
            margin_percentage:
              totalAmount > 0 ? (margin / totalAmount) * 100 : 0,
          };
        });

        // Set data in state
        setParties(Array.isArray(partiesData) ? partiesData : []);
        setQuotations(
          Array.isArray(processedQuotations) ? processedQuotations : []
        );
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
  const getTotalStats = () => {
    const totalSales = quotations.reduce(
      (sum, quote) => sum + (quote.total_amount || 0),
      0
    );

    const totalPurchase = quotations.reduce(
      (sum, quote) => sum + (quote.total_purchase || 0),
      0
    );

    const totalMargin = totalSales - totalPurchase;
    const marginPercentage =
      totalSales > 0 ? (totalMargin / totalSales) * 100 : 0;

    return {
      totalSales,
      totalPurchase,
      totalMargin,
      marginPercentage,
      avgQuotationValue:
        quotations.length > 0 ? totalSales / quotations.length : 0,
      avgMarginValue:
        quotations.length > 0 ? totalMargin / quotations.length : 0,
    };
  };

  const getRecentQuotations = () => {
    // First, filter by search term if provided
    let filteredQuotations = [...quotations];

    if (quotationSearchTerm.trim() !== "") {
      const searchLower = quotationSearchTerm.toLowerCase();
      filteredQuotations = filteredQuotations.filter(
        (quote) =>
          // Search in title
          (quote.title && quote.title.toLowerCase().includes(searchLower)) ||
          // Search in quotation number
          (quote.quotation_number &&
            quote.quotation_number.toLowerCase().includes(searchLower)) ||
          // Search in party name
          (quote.party &&
            quote.party.name &&
            quote.party.name.toLowerCase().includes(searchLower)) ||
          // Search in amount (convert to string)
          String(quote.total_amount || "").includes(searchLower) ||
          // Search in date (formatted)
          formatDate(quote.date).toLowerCase().includes(searchLower)
      );
    }

    // Then sort by date and take first 5 (or all if filtered)
    return quotationSearchTerm.trim() !== ""
      ? filteredQuotations.sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
        )
      : filteredQuotations
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
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
          party.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (party.partyId && party.partyId.includes(searchTerm))
    );
  };

  const getQuotationsForParty = (partyId) => {
    if (!partyId) return [];

    return quotations.filter((quote) => {
      // Check several possible party ID locations
      const quotePartyId =
        (quote.party_id && typeof quote.party_id === "string"
          ? quote.party_id
          : null) ||
        (quote.party_id && quote.party_id._id ? quote.party_id._id : null) ||
        (quote.party && quote.party._id ? quote.party._id : null);

      return quotePartyId === partyId;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Get the latest quotation for a party
  const getLatestQuotationForParty = (partyId) => {
    const partyQuotations = getQuotationsForParty(partyId);
    if (partyQuotations.length === 0) return null;

    return partyQuotations.sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    )[0];
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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          EmpressPC Dashboard
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            value={formatCurrency(getTotalStats().totalSales)}
            icon={<CreditCard />}
            color="green"
          />

          <StatsCard
            title="Total Margin"
            value={formatCurrency(getTotalStats().totalMargin)}
            subtext={`${getTotalStats().marginPercentage.toFixed(2)}%`}
            icon={<TrendingUp />}
            color="purple"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Avg. Value Per Quotation"
            value={formatCurrency(getTotalStats().avgQuotationValue)}
            icon={<BarChart2 />}
            color="blue"
          />

          <StatsCard
            title="Avg. Margin Per Quotation"
            value={formatCurrency(getTotalStats().avgMarginValue)}
            icon={<DollarSign />}
            color="green"
          />

          <StatsCard
            title="Highest Quote Value"
            value={formatCurrency(
              quotations.length > 0
                ? Math.max(...quotations.map((q) => q.total_amount || 0))
                : 0
            )}
            icon={<TrendingUp />}
            color="orange"
          />

          <StatsCard
            title="Latest Quotation Date"
            value={
              quotations.length > 0
                ? formatDate(
                    [...quotations].sort(
                      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
                    )[0].date
                  )
                : "N/A"
            }
            icon={<Calendar />}
            color="purple"
          />
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
                    const latestQuotation = getLatestQuotationForParty(
                      party._id
                    );

                    // Calculate total margin for this party's quotations
                    const partyTotalSales = partyQuotations.reduce(
                      (sum, q) => sum + (q.total_amount || 0),
                      0
                    );
                    const partyTotalPurchase = partyQuotations.reduce(
                      (sum, q) => sum + (q.total_purchase || 0),
                      0
                    );
                    const partyTotalMargin =
                      partyTotalSales - partyTotalPurchase;
                    const partyMarginPercentage =
                      partyTotalSales > 0
                        ? (partyTotalMargin / partyTotalSales) * 100
                        : 0;

                    return (
                      <div key={party._id} className="hover:bg-gray-50">
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => togglePartyExpand(party._id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-gray-800">
                                {party.name || "Unnamed Party"}
                              </h3>
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="h-3 w-3 mr-1" />
                                {party.phone || "No phone"}
                              </div>
                              {party.partyId && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <span className="text-gray-400">ID: </span>
                                  <span className="ml-1">{party.partyId}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                {partyQuotations.length} Quotes
                              </span>

                              {partyQuotations.length > 0 && (
                                <span className="text-xs text-green-600 font-medium mt-1">
                                  {formatCurrency(partyTotalMargin)} (
                                  {partyMarginPercentage.toFixed(1)}%)
                                </span>
                              )}

                              <div className="mt-1">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
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
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Phone:</span>{" "}
                              {party.phone || "N/A"}
                            </p>
                            {party.partyId && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Party ID:</span>{" "}
                                {party.partyId}
                              </p>
                            )}

                            {/* Party Quotation Stats */}
                            {partyQuotations.length > 0 && (
                              <div className="mt-2 mb-3 bg-white p-2 rounded border border-gray-200">
                                <p className="text-sm font-medium text-gray-700">
                                  Total Sales: {formatCurrency(partyTotalSales)}
                                </p>
                                <p className="text-sm font-medium text-green-600">
                                  Total Margin:{" "}
                                  {formatCurrency(partyTotalMargin)} (
                                  {partyMarginPercentage.toFixed(2)}%)
                                </p>

                                {/* Latest quotation margin */}
                                {latestQuotation && (
                                  <p className="text-sm mt-1 text-blue-600">
                                    Latest Quote Margin:{" "}
                                    {formatCurrency(
                                      latestQuotation.margin || 0
                                    )}{" "}
                                    (
                                    {(
                                      latestQuotation.margin_percentage || 0
                                    ).toFixed(2)}
                                    %)
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="mt-3">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Recent Quotations:
                              </h4>
                              {partyQuotations.length > 0 ? (
                                <ul className="space-y-2">
                                  {partyQuotations
                                    .sort(
                                      (a, b) =>
                                        new Date(b.date || 0) -
                                        new Date(a.date || 0)
                                    )
                                    .slice(0, 3)
                                    .map((quote) => (
                                      <li key={quote._id} className="text-sm">
                                        <Link
                                          to={`/quotations/${party._id}?id=${quote._id}`}
                                          className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded"
                                        >
                                          <span className="font-medium">
                                            {quote.title ||
                                              `${party.name} Quotation`}
                                          </span>
                                          <span className="text-gray-600">
                                            {formatDate(quote.date)}
                                          </span>
                                          <div className="text-right">
                                            <span className="font-medium text-green-600">
                                              {formatCurrency(
                                                quote.total_amount || 0
                                              )}
                                            </span>
                                            <span className="block text-xs text-green-700">
                                              Margin:{" "}
                                              {formatCurrency(
                                                quote.margin || 0
                                              )}{" "}
                                              (
                                              {(
                                                quote.margin_percentage || 0
                                              ).toFixed(1)}
                                              %)
                                            </span>
                                          </div>
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
                      {selectedParty.name || "Unnamed Party"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {selectedParty.phone || "No phone"}
                    </p>
                    {selectedParty.partyId && (
                      <p className="text-xs text-gray-500">
                        ID: {selectedParty.partyId}
                      </p>
                    )}
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
                          {selectedParty.name || "Unnamed Party"}
                        </p>
                        <p className="flex items-center text-gray-700 mt-2">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          {selectedParty.phone || "No phone"}
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

                        {/* Calculate party totals */}
                        {(() => {
                          const partyQuotes = getQuotationsForParty(
                            selectedParty._id
                          );
                          const totalValue = partyQuotes.reduce(
                            (sum, q) => sum + (q.total_amount || 0),
                            0
                          );
                          const totalPurchase = partyQuotes.reduce(
                            (sum, q) => sum + (q.total_purchase || 0),
                            0
                          );
                          const totalMargin = totalValue - totalPurchase;
                          const marginPercentage =
                            totalValue > 0
                              ? (totalMargin / totalValue) * 100
                              : 0;

                          // Get latest quotation margin if available
                          const latestQuote =
                            partyQuotes.length > 0
                              ? partyQuotes.sort(
                                  (a, b) =>
                                    new Date(b.date || 0) -
                                    new Date(a.date || 0)
                                )[0]
                              : null;

                          return (
                            <>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">
                                  Total Value:
                                </span>
                                <span className="font-medium text-gray-800">
                                  {formatCurrency(totalValue)}
                                </span>
                              </div>
                              <div className="flex justify-between mb-2">
                                <span className="text-gray-600">
                                  Total Margin:
                                </span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(totalMargin)} (
                                  {marginPercentage.toFixed(2)}%)
                                </span>
                              </div>
                              {latestQuote && (
                                <div className="flex justify-between mb-2">
                                  <span className="text-gray-600">
                                    Latest Quote Margin:
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    {formatCurrency(latestQuote.margin || 0)} (
                                    {(
                                      latestQuote.margin_percentage || 0
                                    ).toFixed(2)}
                                    %)
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}

                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Latest Quotation:
                          </span>
                          <span className="font-medium text-gray-800">
                            {getQuotationsForParty(selectedParty._id).length > 0
                              ? formatDate(
                                  getQuotationsForParty(selectedParty._id).sort(
                                    (a, b) =>
                                      new Date(b.date || 0) -
                                      new Date(a.date || 0)
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
                              Quotation Title
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
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Margin
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {getQuotationsForParty(selectedParty._id)
                            .sort(
                              (a, b) =>
                                new Date(b.date || 0) - new Date(a.date || 0)
                            )
                            .map((quotation) => (
                              <tr
                                key={quotation._id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {quotation.title ||
                                      `${selectedParty.name} Quotation`}
                                  </div>
                                  {quotation.quotation_number && (
                                    <div className="text-xs text-gray-500">
                                      #{quotation.quotation_number}
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                                  {formatCurrency(quotation.total_amount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-green-600">
                                    {formatCurrency(quotation.margin || 0)}
                                  </div>
                                  <div className="text-xs text-green-700">
                                    {(quotation.margin_percentage || 0).toFixed(
                                      2
                                    )}
                                    %
                                  </div>
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

                  {/* Quotation Search */}
                  <div className="mt-3 relative">
                    <input
                      type="text"
                      placeholder="Search quotations by name, number, party, amount..."
                      value={quotationSearchTerm}
                      onChange={(e) => setQuotationSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <button
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      onClick={() => setFilterModalOpen(!filterModalOpen)}
                    >
                      <Filter className="h-5 w-5" />
                    </button>

                    {/* Filter dropdown - can be expanded if needed */}
                    {filterModalOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Filter by:
                          </p>
                          <div className="space-y-2">
                            <label className="flex items-center text-sm">
                              <input type="checkbox" className="mr-2" /> Party
                              Name
                            </label>
                            <label className="flex items-center text-sm">
                              <input type="checkbox" className="mr-2" />{" "}
                              Quotation Number
                            </label>
                            <label className="flex items-center text-sm">
                              <input type="checkbox" className="mr-2" /> Date
                              Range
                            </label>
                            <label className="flex items-center text-sm">
                              <input type="checkbox" className="mr-2" /> Amount
                              Range
                            </label>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <button
                              className="bg-orange-600 text-white px-3 py-1 rounded text-sm"
                              onClick={() => setFilterModalOpen(false)}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {getRecentQuotations().length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">
                        {quotationSearchTerm.trim() !== ""
                          ? "No quotations found matching your search"
                          : "No quotations yet"}
                      </p>
                      {quotationSearchTerm.trim() !== "" && (
                        <button
                          onClick={() => setQuotationSearchTerm("")}
                          className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  ) : (
                    getRecentQuotations().map((quotation) => (
                      <div key={quotation._id} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {quotation.party?.name || "Unknown Party"}:{" "}
                              {quotation.title || "Quotation"}
                            </div>
                            {quotation.quotation_number && (
                              <div className="text-xs text-gray-500">
                                #{quotation.quotation_number}
                              </div>
                            )}
                            <div className="text-sm text-gray-600 mt-1">
                              {quotation.party?.name || "Unknown Party"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-600">
                              {formatCurrency(quotation.total_amount || 0)}
                            </div>
                            <div className="text-xs text-green-700">
                              Margin: {formatCurrency(quotation.margin || 0)} (
                              {(quotation.margin_percentage || 0).toFixed(2)}%)
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
                              to={`/quotations/${
                                quotation.party?._id || quotation.party_id
                              }?id=${quotation._id}`}
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

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                  <Link
                    to="/quotations"
                    className="text-orange-600 hover:text-orange-900 font-medium"
                  >
                    View All Quotations
                  </Link>
                  {quotationSearchTerm.trim() !== "" && (
                    <div className="text-sm text-gray-600">
                      Found {getRecentQuotations().length} matching quotations
                    </div>
                  )}
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
