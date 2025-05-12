import React, { createContext, useContext, useState, useEffect } from "react";
import { useRef } from "react";

// Create context
const QuotationContext = createContext();

// Constants
const DEFAULT_BUSINESS = {
  name: "EmpressPC",
  address: "123 Tech Street, Lucknow, UP 226001",
  phone: "+91 9876543210",
  email: "contact@empresspc.in",
  gstin: "GSTIN1234567890",
  logo: "/logo.png",
};

const GST_RATE = 18; // Default GST rate is 18%

// Provider component
export const QuotationProvider = ({ children }) => {
  // Inside QuotationProvider component
  const prevPartyIdRef = useRef(null);
  const lastFetchedPartyIdRef = useRef(null);
  const isLoadingPartyQuotationsRef = useRef(false);
  
  // State for business details
  const [businessDetails, setBusinessDetails] = useState(DEFAULT_BUSINESS);

  // State for selected party
  const [selectedParty, setSelectedParty] = useState(null);

  // State for quotation items
  const [items, setItems] = useState([]);

  // State for quotation number and date
  const [quotationNumber, setQuotationNumber] = useState("");
  const [quotationDate, setQuotationDate] = useState(new Date());
  const [validUntil, setValidUntil] = useState(
    new Date(new Date().setDate(new Date().getDate() + 15))
  ); // Default valid for 15 days

  // State for notes and terms
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState(
    "1. Prices are valid for the mentioned period only.\n2. Delivery within 3-5 working days after payment confirmation."
  );

  // Define mockComponentsData to use as fallback
  const mockComponentsData = {
    PC_Components: [
      {
        category: "Processor",
        brand: "Intel",
        models: [
          {
            model: "Core i5-12400F",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 16000,
            sale_with_GST: 18500,
          },
          {
            model: "Core i7-12700K",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 28000,
            sale_with_GST: 31500,
          },
          {
            model: "Core i9-13900K",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 50000,
            sale_with_GST: 56500,
          },
        ],
      },
      // Other components as in original file...
    ],
  };

  // State for print mode
  const [printMode, setPrintMode] = useState(false);

  // State for loading saved quotations
  const [savedQuotations, setSavedQuotations] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // State for the PC components data
  const [componentsData, setComponentsData] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  // NEW: State for currently loaded quotation (for revision tracking)
  const [currentQuotationId, setCurrentQuotationId] = useState(null);
  const [isRevision, setIsRevision] = useState(false);
  const [revisionOf, setRevisionOf] = useState(null);
  const [revisionNumber, setRevisionNumber] = useState(0);

  // Handle adding a new item to the quotation
  const addItem = (item) => {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: Date.now().toString(), // Temporary ID for frontend use
        quantity: 1,
        gst_percentage: GST_RATE,
      },
    ]);
  };

  // Handle updating an item
  const updateItem = (id, updatedItem) => {
    setItems((prev) => {
      // Check if item exists
      const exists = prev.some(item => item.id === id);
      
      if (exists) {
        // Update existing item
        return prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item));
      } else {
        // Add new item
        return [...prev, updatedItem];
      }
    });
  };

  // Handle removing an item
  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate total purchase amount
  const calculateTotalPurchase = () => {
    return items.reduce(
      (sum, item) => sum + item.purchase_with_gst * item.quantity,
      0
    );
  };

  // Calculate total sale amount
  const calculateTotalSale = () => {
    return items.reduce(
      (sum, item) => sum + item.sale_with_gst * item.quantity,
      0
    );
  };

  // Calculate total tax
  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      const saleWithoutGst =
        item.sale_with_gst / (1 + item.gst_percentage / 100);
      const tax = item.sale_with_gst - saleWithoutGst;
      return sum + tax * item.quantity;
    }, 0);
  };

  // Calculate margin amount
  const calculateMargin = () => {
    return calculateTotalSale() - calculateTotalPurchase();
  };

  // Calculate margin percentage
  const calculateMarginPercentage = () => {
    const totalSale = calculateTotalSale();
    if (totalSale === 0) return 0;
    return (calculateMargin() / totalSale) * 100;
  };

  // Calculate price without GST
  const calculatePriceWithoutGST = (priceWithGST, gstPercentage = GST_RATE) => {
    return priceWithGST / (1 + gstPercentage / 100);
  };

  // Calculate price with GST
  const calculatePriceWithGST = (priceWithoutGST, gstPercentage = GST_RATE) => {
    return priceWithoutGST * (1 + gstPercentage / 100);
  };

  // Load PC components data
  useEffect(() => {
    const loadComponentsData = async () => {
      try {
        setLoadingComponents(true);

        try {
          // Use the explicit URL with proper headers
          const response = await fetch("http://localhost:5000/api/components", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          });

          // Check if response is OK
          if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(
              `Failed to fetch components: ${response.status} ${response.statusText}`
            );
          }

          // Check the content type
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("Non-JSON response:", text.substring(0, 500));
            throw new Error(
              "Server did not return JSON. Received: " + contentType
            );
          }

          const data = await response.json();

          // Use API data if available
          if (data && data.PC_Components && Array.isArray(data.PC_Components)) {
            setComponentsData(data.PC_Components);
          } else {
            // Fall back to mock data if API response is invalid
            console.log("API returned invalid data format, using mock data");
            setComponentsData(mockComponentsData.PC_Components);
          }
        } catch (error) {
          // Catch any errors and use mock data
          console.error("Error loading components data:", error);
          console.log("Using fallback component data due to API error");
          setComponentsData(mockComponentsData.PC_Components);
        }
      } finally {
        setLoadingComponents(false);
      }
    };

    loadComponentsData();
  }, []);

  // Load party quotations
  const loadPartyQuotations = async (partyId) => {
    // Skip if already loading or if we already loaded quotations for this party
    if (isLoadingPartyQuotationsRef.current || lastFetchedPartyIdRef.current === partyId) {
      console.log(
        `Skipping duplicate loadPartyQuotations for party ${partyId}`
      );
      return;
    }

    try {
      isLoadingPartyQuotationsRef.current = true;
      setLoadingSaved(true);

      console.log(`Fetching quotations for party ID: ${partyId}`);

      const response = await fetch(
        `http://localhost:5000/api/quotations/party/${partyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch party quotations: ${response.status} ${response.statusText}`
        );
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error("Server did not return JSON. Received: " + contentType);
      }

      const data = await response.json();
      setSavedQuotations(Array.isArray(data) ? data : []);

      // Remember that we've loaded quotations for this party
      lastFetchedPartyIdRef.current = partyId;

      console.log(
        `Retrieved ${
          Array.isArray(data) ? data.length : 0
        } quotations for party ${partyId}`
      );
    } catch (error) {
      console.error("Error loading party quotations:", error);
      setSavedQuotations([]);
    } finally {
      setLoadingSaved(false);
      isLoadingPartyQuotationsRef.current = false;
    }
  };

  // NEW: Find the next revision number for a quotation base name
  const findNextRevisionNumber = (baseTitle) => {
    // Filter quotations that match the base name pattern (e.g., "Quotation" or "Quotation (1)")
    const relatedQuotations = savedQuotations.filter(quotation => {
      // Extract the base part of quotation title (before any revision number)
      const quotationTitle = quotation.title || '';
      return quotationTitle === baseTitle || quotationTitle.startsWith(`${baseTitle} (`) && quotationTitle.endsWith(')');
    });
    
    if (relatedQuotations.length === 0) {
      return 0; // No existing quotations, start with no suffix
    }
    
    // Find the highest revision number
    let maxRevision = 0;
    
    relatedQuotations.forEach(quotation => {
      const title = quotation.title || '';
      // Check if it has a revision number in parentheses
      const match = title.match(/\((\d+)\)$/);
      
      if (match) {
        const revNum = parseInt(match[1], 10);
        if (revNum > maxRevision) {
          maxRevision = revNum;
        }
      }
    });
    
    return maxRevision + 1; // Return next revision number
  };

  // NEW: Create a revision title based on base title and revision number
  const createRevisionTitle = (baseTitle, revNum) => {
    if (revNum === 0) {
      return baseTitle;
    }
    return `${baseTitle} (${revNum})`;
  };

  // Save quotation with revision support
  const saveQuotation = async (options = {}) => {
    try {
      if (!selectedParty || !selectedParty._id) {
        throw new Error("Please select a valid party for this quotation");
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Please add at least one item to the quotation");
      }

      // Calculate totals on the client side
      const total_purchase = calculateTotalPurchase();
      const total_sale = calculateTotalSale();
      const total_tax = calculateTotalTax();

      // Validate and clean items data
      const validatedItems = items.map((item) => ({
        category: item.category || "",
        brand: item.brand || "",
        model: item.model || "",
        hsn_sac: item.hsn_sac || "",
        warranty: item.warranty || "",
        quantity: Number(item.quantity) || 1,
        purchase_with_gst: Number(item.purchase_with_gst) || 0,
        sale_with_gst: Number(item.sale_with_gst) || 0,
        gst_percentage: Number(item.gst_percentage) || GST_RATE,
      }));

      // Format dates correctly
      const formattedValidUntil =
        validUntil instanceof Date
          ? validUntil.toISOString()
          : new Date().toISOString();

      const formattedDate =
        quotationDate instanceof Date
          ? quotationDate.toISOString()
          : new Date().toISOString();

      // Base quotation title - use the selected party's name or a default
      const baseTitle = options.baseTitle || `Quotation for ${selectedParty.name}`;
      
      // If this is a revision, determine the next revision number
      let nextRevNum = 0;
      
      if (options.createRevision || isRevision) {
        // If explicitly creating a revision or continuing an existing revision
        const sourceId = options.sourceQuotationId || revisionOf;
        if (sourceId) {
          // Find the original quotation
          const sourceQuotation = savedQuotations.find(q => q._id === sourceId);
          if (sourceQuotation) {
            const sourceTitle = sourceQuotation.title || baseTitle;
            nextRevNum = findNextRevisionNumber(sourceTitle);
          } else {
            nextRevNum = findNextRevisionNumber(baseTitle);
          }
        } else {
          nextRevNum = findNextRevisionNumber(baseTitle);
        }
      }
      
      // Generate title with revision number if needed
      const quotationTitle = createRevisionTitle(baseTitle, nextRevNum);

      // Create quotation data
      const quotationData = {
        party_id: selectedParty._id,
        title: quotationTitle,
        date: formattedDate,
        valid_until: formattedValidUntil,
        business_details: {
          name: businessDetails.name || DEFAULT_BUSINESS.name,
          address: businessDetails.address || DEFAULT_BUSINESS.address,
          phone: businessDetails.phone || DEFAULT_BUSINESS.phone,
          email: businessDetails.email || DEFAULT_BUSINESS.email,
          gstin: businessDetails.gstin || DEFAULT_BUSINESS.gstin,
          logo: businessDetails.logo || DEFAULT_BUSINESS.logo,
        },
        items: validatedItems,
        total_amount: total_sale,
        total_purchase: total_purchase,
        total_tax: total_tax,
        notes: notes || "",
        terms_conditions: terms || "",
        status: "draft",
        
        // Add revision tracking if this is a revision
        ...(nextRevNum > 0 && {
          revision_number: nextRevNum,
          revision_of: options.sourceQuotationId || revisionOf
        })
      };

      console.log("Sending quotation data:", JSON.stringify(quotationData));

      const response = await fetch("http://localhost:5000/api/quotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(quotationData),
      });

      // Check if response is OK
      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Server error: ${response.status}`
          );
        } else {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(
            `Failed to save quotation: ${response.status} ${response.statusText}`
          );
        }
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error("Server did not return JSON. Received: " + contentType);
      }

      const savedQuotation = await response.json();

      // Update the saved quotations list
      setSavedQuotations((prev) => [savedQuotation, ...prev]);

      // Set the quotation number from the saved quotation
      if (savedQuotation.quotation_number) {
        setQuotationNumber(savedQuotation.quotation_number);
      }
      
      // Update revision tracking state
      setCurrentQuotationId(savedQuotation._id);
      if (nextRevNum > 0) {
        setIsRevision(true);
        setRevisionNumber(nextRevNum);
        setRevisionOf(options.sourceQuotationId || revisionOf);
      } else {
        setIsRevision(false);
        setRevisionNumber(0);
        setRevisionOf(null);
      }

      return savedQuotation;
    } catch (error) {
      console.error("Error saving quotation:", error);
      throw error;
    }
  };

  // Create a new revision of an existing quotation
  const createRevision = async (quotationId) => {
    try {
      // First, load the quotation
      const quotation = await loadQuotation(quotationId);
      
      // Then, save it as a revision
      return await saveQuotation({
        createRevision: true,
        sourceQuotationId: quotationId,
        baseTitle: quotation.title || `Quotation for ${selectedParty.name}`
      });
    } catch (error) {
      console.error("Error creating revision:", error);
      throw error;
    }
  };

  // Load a quotation
  const loadQuotation = async (quotationId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/quotations/${quotationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Check if response is OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch quotation: ${response.status} ${response.statusText}`
        );
      }

      // Check content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 500));
        throw new Error("Server did not return JSON. Received: " + contentType);
      }

      const quotation = await response.json();

      // Update all state with the loaded quotation data
      setSelectedParty(quotation.party);
      setBusinessDetails(quotation.business_details);
      setItems(
        quotation.items.map((item) => ({
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        }))
      );
      setQuotationNumber(quotation.quotation_number);
      setQuotationDate(new Date(quotation.date));
      setValidUntil(
        quotation.valid_until ? new Date(quotation.valid_until) : null
      );
      setNotes(quotation.notes || "");
      setTerms(quotation.terms_conditions || "");
      
      // Set revision tracking information
      setCurrentQuotationId(quotation._id);
      setIsRevision(!!quotation.revision_number);
      setRevisionNumber(quotation.revision_number || 0);
      setRevisionOf(quotation.revision_of || null);

      return quotation;
    } catch (error) {
      console.error("Error loading quotation:", error);
      throw error;
    }
  };

  // Reset the quotation form
  const resetQuotation = () => {
    setSelectedParty(null);
    setItems([]);
    setQuotationNumber("");
    setQuotationDate(new Date());
    setValidUntil(new Date(new Date().setDate(new Date().getDate() + 15)));
    setNotes("");
    setTerms(
      "1. Prices are valid for the mentioned period only.\n2. Payment terms: 100% advance payment.\n3. Delivery within 3-5 working days after payment confirmation."
    );
    setCurrentQuotationId(null);
    setIsRevision(false);
    setRevisionNumber(0);
    setRevisionOf(null);
  };

  // Toggle print mode
  const togglePrintMode = () => {
    setPrintMode(!printMode);
  };

  // Context value
  const contextValue = {
    // Business details
    businessDetails,
    setBusinessDetails,

    // Party details
    selectedParty,
    setSelectedParty,

    // Items
    items,
    setItems,
    addItem,
    updateItem,
    removeItem,

    // Quotation details
    quotationNumber,
    setQuotationNumber,
    quotationDate,
    setQuotationDate,
    validUntil,
    setValidUntil,
    notes,
    setNotes,
    terms,
    setTerms,

    // Calculations
    calculateTotalPurchase,
    calculateTotalSale,
    calculateTotalTax,
    calculateMargin,
    calculateMarginPercentage,
    calculatePriceWithoutGST,
    calculatePriceWithGST,
    GST_RATE,

    // Saved quotations
    savedQuotations,
    loadingSaved,
    loadPartyQuotations,

    // Components data
    componentsData,
    loadingComponents,

    // Revision tracking
    currentQuotationId,
    isRevision,
    revisionNumber,
    revisionOf,
    createRevision,
    
    // Actions
    saveQuotation,
    loadQuotation,
    resetQuotation,

    // Print mode
    printMode,
    togglePrintMode,
  };

  return (
    <QuotationContext.Provider value={contextValue}>
      {children}
    </QuotationContext.Provider>
  );
};

// Custom hook for using the context
export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error("useQuotation must be used within a QuotationProvider");
  }
  return context;
};

// ErrorBoundary component for error handling
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Quotation error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md my-4">
          <h3 className="font-bold">Something went wrong</h3>
          <p>{this.state.error?.message || "An unknown error occurred"}</p>
          <button
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}