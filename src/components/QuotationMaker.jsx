import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useQuotation,
  QuotationProvider,
  ErrorBoundary,
} from "../context/QuotationContext";
import {
  Save,
  Download,
  Printer,
  FileText,
  ChevronLeft,
  PlusCircle,
} from "lucide-react";

// Component imports
import BusinessDetailsForm from "./quotation/BusinessDetailsForm";
import CustomerDetailsForm from "./quotation/CustomerDetailsForm";
import ItemsTable from "./quotation/ItemsTable";
import ComponentBrowser from "./quotation/ComponentBrowser";
import QuotationSummary from "./quotation/QuotationSummary";
import SavedQuotations from "./quotation/SavedQuotation";
import PrintMode from "./quotation/PrintMode";

// Main content component (separated from wrapper to use context)
const QuotationMakerContent = () => {
  const {
    printMode,
    togglePrintMode,
    selectedParty,
    setSelectedParty,
    loadPartyQuotations,
  } = useQuotation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { partyId } = useParams();
  const navigate = useNavigate();

  // Use refs to prevent infinite loops
  const loadingPartyRef = useRef(false);
  const loadedPartyIdRef = useRef(null);

  // Load party data and quotations when component mounts
  useEffect(() => {
    // In QuotationMaker.jsx, update the loadPartyData function:

    const loadPartyData = async () => {
      // Skip if we're already loading or have loaded this party
      if (
        loadingPartyRef.current ||
        (partyId && loadedPartyIdRef.current === partyId)
      ) {
        console.log(`Skipping duplicate party load for ID: ${partyId}`);
        return;
      }

      if (partyId) {
        try {
          // Set loading flag to prevent duplicate calls
          loadingPartyRef.current = true;

          console.log(`Loading party data for ID: ${partyId}`);

          // Try using a different endpoint or include better error handling
          // const response = await fetch(`https://server12may.onrender.com/api/parties/${partyId}`, {
          const response = await fetch(
            `https://server12may.onrender.com/api/parties/${partyId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
            }
          );

          // Check if the response is OK
          if (!response.ok) {
            if (response.status === 404) {
              // Party not found - handle gracefully
              setErrorMessage(
                `Party with ID ${partyId} was not found. Please select another party.`
              );

              // Redirect to the parties list if party not found
              navigate("/parties");
              return;
            }

            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(
              `Failed to fetch party: ${response.status} ${response.statusText}`
            );
          }

          // Rest of your function remains the same
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Non-JSON response:", text.substring(0, 500));
            throw new Error(
              "Server did not return JSON. Received: " + contentType
            );
          }

          const party = await response.json();

          // Only update if we haven't set this party already
          if (!selectedParty || selectedParty._id !== party._id) {
            console.log(
              `Setting selected party to: ${party.name} (${party._id})`
            );
            setSelectedParty(party);
          }

          // Remember we've loaded this party
          loadedPartyIdRef.current = partyId;
        } catch (error) {
          setErrorMessage(`Error loading party: ${error.message}`);
          // If there's a loading error, consider navigating back to parties list
          // navigate('/parties');
        } finally {
          // Clear loading flag
          loadingPartyRef.current = false;
        }
      }
    };

    loadPartyData();
  }, [partyId]); // Only depend on partyId

  // Handle back to parties
  const handleBackToParties = () => {
    navigate("/parties");
  };

  // Render print mode if active
  if (printMode) {
    return <PrintMode />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={handleBackToParties}
            className="p-2 mr-4 text-gray-100 hover:text-white hover:bg-orange-700 bg-orange-600 rounded flex items-center"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            <span>Back to Parties</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">EMPRESSPC.IN</h1>
            {selectedParty && (
              <p className="text-gray-300 mt-1">
                Creating quotation for: {selectedParty.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={togglePrintMode}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Preview
          </button>
        </div>
      </div>
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md my-4 animate-fadeIn relative">
          <div className="flex items-center">
            <div className="py-1">
              <p className="font-bold">Success</p>
              <p>{successMessage}</p>
            </div>
          </div>
          <button
            className="absolute top-2 right-2 text-green-700"
            onClick={() => setSuccessMessage("")}
          >
            &times;
          </button>
        </div>
      )}
      // In QuotationMaker.jsx, update the error message section
      {errorMessage && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md my-4 animate-fadeIn relative">
          <div className="flex items-center">
            <div className="py-1">
              <p className="font-bold">Error</p>
              <p>{errorMessage}</p>

              {/* Add back button if the error is related to party not found */}
              {errorMessage.includes("not found") && (
                <button
                  onClick={handleBackToParties}
                  className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-sm"
                >
                  Back to Parties
                </button>
              )}
            </div>
          </div>
          <button
            className="absolute top-2 right-2 text-red-700"
            onClick={() => setErrorMessage("")}
          >
            &times;
          </button>
        </div>
      )}
      {/* Customer selection section */}
      <CustomerDetailsForm />
      {/* If no party is selected, show a message */}
      {!selectedParty && (
        <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded shadow-md my-4">
          <p className="font-bold">No Party Selected</p>
          <p>
            Please select a party from the search above to create a quotation.
          </p>
          <button
            onClick={handleBackToParties}
            className="mt-2 bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          >
            Go to Parties
          </button>
        </div>
      )}
      {selectedParty && (
        <>
          {/* Saved Quotations */}
          <SavedQuotations
            setSuccessMessage={setSuccessMessage}
            setErrorMessage={setErrorMessage}
          />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Business Details */}
              <BusinessDetailsForm />

              {/* Items Selection */}
              <ItemsTable
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Component Browser */}
              <ComponentBrowser />

              {/* Quote Summary */}
              <QuotationSummary
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Wrapper component that provides context
const QuotationMaker = () => {
  return (
    <ErrorBoundary>
      <QuotationProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-gray-200">
          <QuotationMakerContent />
        </div>
      </QuotationProvider>
    </ErrorBoundary>
  );
};

export default QuotationMaker;
