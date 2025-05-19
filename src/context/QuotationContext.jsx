import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";

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

// Create context
const QuotationContext = createContext();

// Provider component
export const QuotationProvider = ({ children }) => {
  // Refs to prevent unnecessary rerenders and API calls
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

  // State for print mode
  const [printMode, setPrintMode] = useState(false);

  // State for loading saved quotations
  const [savedQuotations, setSavedQuotations] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [allQuotations, setAllQuotations] = useState([]);
  const [loadingAllQuotations, setLoadingAllQuotations] = useState(false);

  // State for the PC components data
  const [componentsData, setComponentsData] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState(false);

  // State for currently loaded quotation (for revision tracking)
  const [currentQuotationId, setCurrentQuotationId] = useState(null);
  const [isRevision, setIsRevision] = useState(false);
  const [revisionOf, setRevisionOf] = useState(null);
  const [revisionNumber, setRevisionNumber] = useState(0);

  // Define the generateQuotationName function early to avoid initialization errors
  const generateQuotationName = (partyId, version = 1) => {
    if (!partyId) return "quote-unknown-1";
    
    // Take the first 8 characters of the party ID
    // Add extra safety check for partyId
    const shortPartyId = partyId ? partyId.substring(0, 8) : "unknown";
    return `quote-${shortPartyId}-${version}`;
  };

  // Define findNextVersionNumber early as well
  const findNextVersionNumber = (partyId) => {
    if (!partyId || !Array.isArray(savedQuotations)) return 1;
    
    // Find all quotations for this party that follow our naming convention
    const partyQuotations = savedQuotations.filter(quotation => {
      const title = quotation.title || "";
      return title.startsWith(`quote-${partyId ? partyId.substring(0, 8) : "unknown"}-`);
    });
    
    if (partyQuotations.length === 0) return 1;
    
    // Extract versions from all matching quotations
    let maxVersion = 0;
    partyQuotations.forEach(quotation => {
      const title = quotation.title || "";
      const match = title.match(/quote-.*?-(\d+)$/);
      if (match) {
        const version = parseInt(match[1], 10);
        if (version > maxVersion) {
          maxVersion = version;
        }
      }
    });
    
    return maxVersion + 1;
  };

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
      const exists = prev.some((item) => item.id === id);

      if (exists) {
        // Update existing item
        return prev.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        );
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
      (sum, item) =>
        sum +
        (Number(item.purchase_with_gst) || 0) * (Number(item.quantity) || 1),
      0
    );
  };

  // Calculate total sale amount
  const calculateTotalSale = () => {
    return items.reduce(
      (sum, item) =>
        sum + (Number(item.sale_with_gst) || 0) * (Number(item.quantity) || 1),
      0
    );
  };

  // Calculate total tax
  const calculateTotalTax = () => {
    return items.reduce((sum, item) => {
      const saleWithoutGst =
        (Number(item.sale_with_gst) || 0) /
        (1 + (Number(item.gst_percentage) || GST_RATE) / 100);
      const tax = (Number(item.sale_with_gst) || 0) - saleWithoutGst;
      return sum + tax * (Number(item.quantity) || 1);
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
    if (!priceWithGST) return 0;
    return (
      Number(priceWithGST) / (1 + (Number(gstPercentage) || GST_RATE) / 100)
    );
  };

  // Calculate price with GST
  const calculatePriceWithGST = (priceWithoutGST, gstPercentage = GST_RATE) => {
    if (!priceWithoutGST) return 0;
    return (
      Number(priceWithoutGST) * (1 + (Number(gstPercentage) || GST_RATE) / 100)
    );
  };

  // Load PC components data
  useEffect(() => {
    const loadComponentsData = async () => {
      try {
        setLoadingComponents(true);
        const response = await fetch("https://server12may.onrender.com/api/components", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch components: ${response.status}`);
        }

        const data = await response.json();
        setComponentsData(data.PC_Components || []);
      } catch (error) {
        console.error("Error loading components data:", error);
        // Set default components if API fails
        setComponentsData([]);
      } finally {
        setLoadingComponents(false);
      }
    };

    loadComponentsData();
  }, []);
  
  // Fetch all quotations on initial load (optional)
  useEffect(() => {
    // Call this if you want to automatically load all quotations when the app starts
    // Uncomment the next line to enable auto-loading
    // fetchAllQuotations();
  }, []);

  // Load party quotations
  const loadPartyQuotations = async (partyId) => {
    // Skip if already loading or if we already loaded quotations for this party
    if (
      isLoadingPartyQuotationsRef.current ||
      lastFetchedPartyIdRef.current === partyId
    ) {
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
        `https://server12may.onrender.com/api/quotations/party/${partyId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch party quotations: ${response.status}`);
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

  // Load all quotations from the API
  const fetchAllQuotations = async () => {
    try {
      setLoadingAllQuotations(true);
      console.log('Fetching all quotations');

      const response = await fetch(
        'https://server12may.onrender.com/api/quotations',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch quotations: ${response.status}`);
      }

      const data = await response.json();
      setAllQuotations(Array.isArray(data) ? data : []);

      console.log(
        `Retrieved ${Array.isArray(data) ? data.length : 0} total quotations`
      );
      return data;
    } catch (error) {
      console.error('Error loading all quotations:', error);
      setAllQuotations([]);
      throw error;
    } finally {
      setLoadingAllQuotations(false);
    }
  };

  // Updated save quotation function with new naming convention
  const saveQuotation = async (options = {}) => {
    try {
      if (!selectedParty || !selectedParty._id) {
        throw new Error("Please select a valid party for this quotation");
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Please add at least one item to the quotation");
      }

      // Calculate totals
      const total_purchase = Number(calculateTotalPurchase());
      const total_sale = Number(calculateTotalSale());
      const total_tax = Number(calculateTotalTax());

      // Validate and clean items data - create new objects to avoid mutation
      const validatedItems = items.map((item, index) => {
        if (!item.category || !item.brand || !item.model) {
          throw new Error(
            `Item ${index + 1} is missing required fields (category, brand, model)`
          );
        }

        // Get HSN/SAC from either property name
        let hsn_sac = "";
        if (item.hsn_sac) {
          hsn_sac = String(item.hsn_sac).trim();
        } else if (item["HSN/SAC"]) {
          hsn_sac = String(item["HSN/SAC"]).trim();
        } else {
          hsn_sac = "84733099"; // Default HSN code for computer parts
        }

        // Create a NEW clean object without id fields
        return {
          category: String(item.category).trim(),
          brand: String(item.brand).trim(),
          model: String(item.model).trim(),
          hsn_sac: hsn_sac,
          warranty: String(item.warranty || "").trim(),
          quantity: Number(item.quantity) || 1,
          purchase_with_gst: Number(item.purchase_with_gst) || 0,
          sale_with_gst: Number(item.sale_with_gst) || 0,
          gst_percentage: Number(item.gst_percentage) || GST_RATE,
        };
      });

      // Format dates
      let validUntilDate;
      try {
        validUntilDate =
          validUntil instanceof Date && !isNaN(validUntil.getTime())
            ? validUntil.toISOString()
            : new Date(
                new Date().setDate(new Date().getDate() + 15)
              ).toISOString();
      } catch (e) {
        console.error("Error formatting validUntil date:", e);
        validUntilDate = new Date(
          new Date().setDate(new Date().getDate() + 15)
        ).toISOString();
      }

      let quotationDateFormatted;
      try {
        quotationDateFormatted =
          quotationDate instanceof Date && !isNaN(quotationDate.getTime())
            ? quotationDate.toISOString()
            : new Date().toISOString();
      } catch (e) {
        console.error("Error formatting quotationDate:", e);
        quotationDateFormatted = new Date().toISOString();
      }

      // Determine version number for the quotation
      let versionNumber = 1;
      
      if (options.createRevision || isRevision) {
        const sourceId = options.sourceQuotationId || revisionOf;
        if (sourceId && Array.isArray(savedQuotations)) {
          const sourceQuotation = savedQuotations.find(q => q._id === sourceId);
          
          if (sourceQuotation && sourceQuotation.title) {
            // Extract version from the title if it follows our format
            const match = sourceQuotation.title.match(/quote-.*?-(\d+)$/);
            if (match) {
              versionNumber = parseInt(match[1], 10) + 1;
            } else {
              // If the title doesn't match our format, find the next version
              versionNumber = findNextVersionNumber(selectedParty._id);
            }
          } else {
            versionNumber = findNextVersionNumber(selectedParty._id);
          }
        } else {
          versionNumber = findNextVersionNumber(selectedParty._id);
        }
      } else {
        // For new quotations, check if there are existing ones for this party
        versionNumber = findNextVersionNumber(selectedParty._id);
      }
      
      // Generate the quotation name in our required format
      const quotationTitle = generateQuotationName(selectedParty._id, versionNumber);

      // Prepare business details object - with null checks
      const businessDetailsObj = {
        name: businessDetails?.name || DEFAULT_BUSINESS.name,
        address: businessDetails?.address || DEFAULT_BUSINESS.address,
        phone: businessDetails?.phone || DEFAULT_BUSINESS.phone,
        email: businessDetails?.email || DEFAULT_BUSINESS.email,
        gstin: businessDetails?.gstin || DEFAULT_BUSINESS.gstin,
        logo: businessDetails?.logo || DEFAULT_BUSINESS.logo,
      };

      // Prepare the quotation data - as a fresh object without any id field
      const quotationData = {
        party_id: selectedParty._id,
        title: quotationTitle,
        quotation_number: quotationTitle, // Use the same format for the quotation number
        date: quotationDateFormatted,
        valid_until: validUntilDate,
        business_details: businessDetailsObj,
        items: validatedItems,
        total_amount: total_sale,
        total_purchase: total_purchase,
        total_tax: total_tax,
        notes: notes || "",
        terms_conditions: terms || "",
        status: "draft",
      };

      // Add revision tracking if this is a revision
      if (versionNumber > 1) {
        quotationData.revision_number = versionNumber;
        if (options.sourceQuotationId || revisionOf) {
          quotationData.revision_of = options.sourceQuotationId || revisionOf;
        }
      }

      console.log("Sending quotation data:", JSON.stringify(quotationData, null, 2));

      // Send the request
      let responseData;

      try {
        const response = await fetch("https://server12may.onrender.com/api/quotations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(quotationData),
        });

        // Check if response is OK
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);

          // Try to parse as JSON if possible
          try {
            const errorJson = JSON.parse(errorText);
            throw new Error(
              errorJson.message || `Server error: ${response.status}`
            );
          } catch (jsonError) {
            // If not valid JSON, use the text directly
            throw new Error(
              `Failed to save: ${response.status} ${response.statusText}. ${errorText}`
            );
          }
        }

        // Read the response body as text first
        const responseText = await response.text();
        console.log("Raw response:", responseText);
        
        // Parse the response
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          throw new Error("Invalid JSON response from server");
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        throw new Error(`Request failed: ${fetchError.message}`);
      }

      // If we got here, we have successfully parsed the response
      const savedQuotation = responseData;

      // Update the state with the savedQuotation
      if (savedQuotation.quotation_number) {
        setQuotationNumber(savedQuotation.quotation_number);
      }
      setSavedQuotations((prev) => [savedQuotation, ...prev]);
      setCurrentQuotationId(savedQuotation._id);

      // Update revision tracking state
      if (versionNumber > 1) {
        setIsRevision(true);
        setRevisionNumber(versionNumber);
        setRevisionOf(options.sourceQuotationId || revisionOf);
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
        sourceQuotationId: quotationId
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
        `https://server12may.onrender.com/api/quotations/${quotationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch quotation: ${response.status}`);
      }

      const quotation = await response.json();

      // Update all state with the loaded quotation data
      setSelectedParty(quotation.party);
      setBusinessDetails(quotation.business_details || DEFAULT_BUSINESS);
      setItems(
        quotation.items.map((item) => ({
          ...item,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        }))
      );
      setQuotationNumber(quotation.quotation_number || "");
      setQuotationDate(new Date(quotation.date || Date.now()));
      setValidUntil(
        quotation.valid_until
          ? new Date(quotation.valid_until)
          : new Date(new Date().setDate(new Date().getDate() + 15))
      );
      setNotes(quotation.notes || "");
      setTerms(quotation.terms_conditions || "");

      // Set revision tracking information
      setCurrentQuotationId(quotation._id);
      
      // Extract version from title if it follows our format
      let extractedVersion = 1;
      if (quotation.title) {
        const match = quotation.title.match(/quote-.*?-(\d+)$/);
        if (match) {
          extractedVersion = parseInt(match[1], 10);
        }
      }
      
      setIsRevision(extractedVersion > 1);
      setRevisionNumber(quotation.revision_number || extractedVersion);
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

  // Context value - all the values and functions to expose
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
    
    // All quotations
    allQuotations,
    loadingAllQuotations,
    fetchAllQuotations,

    // Components data
    componentsData,
    loadingComponents,

    // Revision tracking
    currentQuotationId,
    isRevision,
    revisionNumber,
    revisionOf,
    createRevision,

    // New quotation naming functions
    generateQuotationName,
    findNextVersionNumber,

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