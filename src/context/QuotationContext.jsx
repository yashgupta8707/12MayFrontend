import React, { createContext, useContext, useState, useEffect } from "react";
// Add to your imports
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
    // "1. Prices are valid for the mentioned period only.\n2. Payment terms: 100% advance payment.\n3. Delivery within 3-5 working days after payment confirmation."
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
      {
        category: "Graphics Card",
        brand: "NVIDIA",
        models: [
          {
            model: "RTX 3060",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 30000,
            sale_with_GST: 34000,
          },
          {
            model: "RTX 4070",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 55000,
            sale_with_GST: 61000,
          },
          {
            model: "RTX 4090",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 140000,
            sale_with_GST: 152000,
          },
        ],
      },
      {
        category: "Motherboard",
        brand: "ASUS",
        models: [
          {
            model: "ROG Strix B660-F",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 17500,
            sale_with_GST: 19500,
          },
          {
            model: "TUF Gaming X670E",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 29500,
            sale_with_GST: 32500,
          },
          {
            model: "PRIME Z790-P",
            "HSN/SAC": "84733099",
            warranty: "3 Years",
            purchase_with_GST: 21500,
            sale_with_GST: 23800,
          },
        ],
      },
      {
        category: "RAM",
        brand: "Corsair",
        models: [
          {
            model: "Vengeance LPX 16GB DDR4",
            "HSN/SAC": "84733092",
            warranty: "10 Years",
            purchase_with_GST: 4000,
            sale_with_GST: 4600,
          },
          {
            model: "Vengeance RGB Pro 32GB DDR4",
            "HSN/SAC": "84733092",
            warranty: "10 Years",
            purchase_with_GST: 8200,
            sale_with_GST: 9100,
          },
          {
            model: "Dominator Platinum RGB 32GB DDR5",
            "HSN/SAC": "84733092",
            warranty: "10 Years",
            purchase_with_GST: 15500,
            sale_with_GST: 17200,
          },
        ],
      },
      {
        category: "SSD",
        brand: "Samsung",
        models: [
          {
            model: "970 EVO Plus 500GB NVMe",
            "HSN/SAC": "84717020",
            warranty: "5 Years",
            purchase_with_GST: 3300,
            sale_with_GST: 3900,
          },
          {
            model: "980 PRO 1TB NVMe",
            "HSN/SAC": "84717020",
            warranty: "5 Years",
            purchase_with_GST: 7500,
            sale_with_GST: 8500,
          },
          {
            model: "990 PRO 2TB NVMe",
            "HSN/SAC": "84717020",
            warranty: "5 Years",
            purchase_with_GST: 15800,
            sale_with_GST: 17400,
          },
        ],
      },
      {
        category: "Power Supply",
        brand: "Cooler Master",
        models: [
          {
            model: "MWE 550 Bronze V2",
            "HSN/SAC": "85044010",
            warranty: "5 Years",
            purchase_with_GST: 3300,
            sale_with_GST: 3800,
          },
          {
            model: "MWE 750 White V2",
            "HSN/SAC": "85044010",
            warranty: "5 Years",
            purchase_with_GST: 4300,
            sale_with_GST: 4900,
          },
          {
            model: "V850 Gold V2 Full Modular",
            "HSN/SAC": "85044010",
            warranty: "10 Years",
            purchase_with_GST: 9900,
            sale_with_GST: 10800,
          },
        ],
      },
      {
        category: "Cabinet",
        brand: "NZXT",
        models: [
          {
            model: "H510",
            "HSN/SAC": "84733099",
            warranty: "2 Years",
            purchase_with_GST: 5200,
            sale_with_GST: 5900,
          },
          {
            model: "H7 Flow RGB",
            "HSN/SAC": "84733099",
            warranty: "2 Years",
            purchase_with_GST: 8800,
            sale_with_GST: 9800,
          },
          {
            model: "H9 Elite",
            "HSN/SAC": "84733099",
            warranty: "2 Years",
            purchase_with_GST: 13200,
            sale_with_GST: 14500,
          },
        ],
      },
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
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedItem } : item))
    );
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

  // Update the loadComponentsData function in QuotationContext.js

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

  // Load saved quotations
  const loadSavedQuotations = async () => {
    try {
      setLoadingSaved(true);

      const response = await fetch("/api/quotations");
      if (!response.ok) throw new Error("Failed to fetch quotations");

      const data = await response.json();
      setSavedQuotations(data);
    } catch (error) {
      console.error("Error loading saved quotations:", error);
    } finally {
      setLoadingSaved(false);
    }
  };

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

  // Save quotation
  const saveQuotation = async () => {
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

      // Create quotation data
      const quotationData = {
        party_id: selectedParty._id,
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

      return savedQuotation;
    } catch (error) {
      console.error("Error saving quotation:", error);
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
    loadSavedQuotations,
    loadPartyQuotations,

    // Components data
    componentsData,
    loadingComponents,

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
