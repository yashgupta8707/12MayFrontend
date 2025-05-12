import React, { useState, useEffect } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { Computer, Cpu, HardDrive, Monitor, PlusCircle, Search, Package, ChevronDown, ChevronUp } from 'lucide-react';

// PC components data from your provided JSON - use directly to avoid API issues
const mockComponentsData = {
  "PC_Components": [
    {
      "category": "Processor",
      "brand": "Intel",
      "models": [
        {
          "model": "Core i5-12400F",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 16000,
          "sale_with_GST": 18500
        },
        {
          "model": "Core i7-12700K",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 28000,
          "sale_with_GST": 31500
        },
        {
          "model": "Core i9-13900K",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 50000,
          "sale_with_GST": 56500
        }
      ]
    },
    {
      "category": "Graphics Card",
      "brand": "NVIDIA",
      "models": [
        {
          "model": "RTX 3060",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 30000,
          "sale_with_GST": 34000
        },
        {
          "model": "RTX 4070",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 55000,
          "sale_with_GST": 61000
        },
        {
          "model": "RTX 4090",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 140000,
          "sale_with_GST": 152000
        }
      ]
    },
    {
      "category": "Motherboard",
      "brand": "ASUS",
      "models": [
        {
          "model": "ROG Strix B660-F",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 17500,
          "sale_with_GST": 19500
        },
        {
          "model": "TUF Gaming X670E",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 29500,
          "sale_with_GST": 32500
        },
        {
          "model": "PRIME Z790-P",
          "HSN/SAC": "84733099",
          "warranty": "3 Years",
          "purchase_with_GST": 21500,
          "sale_with_GST": 23800
        }
      ]
    },
    {
      "category": "RAM",
      "brand": "Corsair",
      "models": [
        {
          "model": "Vengeance LPX 16GB DDR4",
          "HSN/SAC": "84733092",
          "warranty": "10 Years",
          "purchase_with_GST": 4000,
          "sale_with_GST": 4600
        },
        {
          "model": "Vengeance RGB Pro 32GB DDR4",
          "HSN/SAC": "84733092",
          "warranty": "10 Years",
          "purchase_with_GST": 8200,
          "sale_with_GST": 9100
        },
        {
          "model": "Dominator Platinum RGB 32GB DDR5",
          "HSN/SAC": "84733092",
          "warranty": "10 Years",
          "purchase_with_GST": 15500,
          "sale_with_GST": 17200
        }
      ]
    },
    {
      "category": "SSD",
      "brand": "Samsung",
      "models": [
        {
          "model": "970 EVO Plus 500GB NVMe",
          "HSN/SAC": "84717020",
          "warranty": "5 Years",
          "purchase_with_GST": 3300,
          "sale_with_GST": 3900
        },
        {
          "model": "980 PRO 1TB NVMe",
          "HSN/SAC": "84717020",
          "warranty": "5 Years",
          "purchase_with_GST": 7500,
          "sale_with_GST": 8500
        },
        {
          "model": "990 PRO 2TB NVMe",
          "HSN/SAC": "84717020",
          "warranty": "5 Years",
          "purchase_with_GST": 15800,
          "sale_with_GST": 17400
        }
      ]
    },
    {
      "category": "Power Supply",
      "brand": "Cooler Master",
      "models": [
        {
          "model": "MWE 550 Bronze V2",
          "HSN/SAC": "85044010",
          "warranty": "5 Years",
          "purchase_with_GST": 3300,
          "sale_with_GST": 3800
        },
        {
          "model": "MWE 750 White V2",
          "HSN/SAC": "85044010",
          "warranty": "5 Years",
          "purchase_with_GST": 4300,
          "sale_with_GST": 4900
        },
        {
          "model": "V850 Gold V2 Full Modular",
          "HSN/SAC": "85044010",
          "warranty": "10 Years",
          "purchase_with_GST": 9900,
          "sale_with_GST": 10800
        }
      ]
    },
    {
      "category": "Cabinet",
      "brand": "NZXT",
      "models": [
        {
          "model": "H510",
          "HSN/SAC": "84733099",
          "warranty": "2 Years",
          "purchase_with_GST": 5200,
          "sale_with_GST": 5900
        },
        {
          "model": "H7 Flow RGB",
          "HSN/SAC": "84733099",
          "warranty": "2 Years",
          "purchase_with_GST": 8800,
          "sale_with_GST": 9800
        },
        {
          "model": "H9 Elite",
          "HSN/SAC": "84733099",
          "warranty": "2 Years",
          "purchase_with_GST": 13200,
          "sale_with_GST": 14500
        }
      ]
    }
  ]
};

const ComponentBrowser = () => {
  const { addItem, GST_RATE } = useQuotation();
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComponents, setFilteredComponents] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedBrands, setExpandedBrands] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Load components on mount - directly use the mock data to avoid API issues
  useEffect(() => {
    setLoading(true);
    // Use mock data directly instead of API
    setTimeout(() => {
      setComponents(mockComponentsData.PC_Components);
      setFilteredComponents(mockComponentsData.PC_Components);
      setLoading(false);
    }, 300);
  }, []);
  
  // Filter components based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      // If no search term, filter by selected category if any
      if (selectedCategory) {
        setFilteredComponents(components.filter(comp => 
          comp.category === selectedCategory
        ));
      } else {
        setFilteredComponents(components);
      }
      return;
    }
    
    const term = searchTerm.toLowerCase();
    
    // Filter components by search term
    const filtered = components.filter(component => {
      // Check if category or brand matches
      if (
        component.category.toLowerCase().includes(term) ||
        component.brand.toLowerCase().includes(term)
      ) {
        return true;
      }
      
      // Check if any model matches
      return component.models.some(model => 
        model.model.toLowerCase().includes(term)
      );
    });
    
    setFilteredComponents(filtered);
  }, [searchTerm, components, selectedCategory]);
  
  // Handle category filter
  const handleCategoryFilter = (category) => {
    if (selectedCategory === category) {
      // If clicking the already selected category, clear filter
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
    
    // Clear search when changing category
    setSearchTerm('');
  };
  
  // Toggle expand/collapse for a brand
  const toggleBrand = (categoryIndex, brand) => {
    setExpandedBrands(prev => ({
      ...prev,
      [`${categoryIndex}-${brand}`]: !prev[`${categoryIndex}-${brand}`]
    }));
  };
  
  // Add a component to the quotation
  const handleAddComponent = (component, model) => {
    const newItem = {
      id: Date.now().toString(),
      category: component.category,
      brand: component.brand,
      model: model.model,
      hsn_sac: model["HSN/SAC"],
      warranty: model.warranty,
      quantity: 1,
      purchase_with_gst: model.purchase_with_GST,
      sale_with_gst: model.sale_with_GST,
      gst_percentage: GST_RATE
    };
    
    addItem(newItem);
  };
  
  // Get icon for category
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'processor':
        return <Cpu className="h-5 w-5" />;
      case 'graphics card':
        return <Monitor className="h-5 w-5" />;
      case 'motherboard':
        return <HardDrive className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Computer className="mr-2 h-5 w-5 text-orange-500" />
          Component Browser
        </h2>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search components..."
          className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {components.map((component) => (
          <button
            key={component.category}
            onClick={() => handleCategoryFilter(component.category)}
            className={`px-3 py-1 rounded-full text-sm flex items-center ${
              selectedCategory === component.category
                ? 'bg-orange-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {getCategoryIcon(component.category)}
            <span className="ml-1">{component.category}</span>
          </button>
        ))}
        
        {selectedCategory && (
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-3 py-1 rounded-full text-sm bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            Clear
          </button>
        )}
      </div>
      
      {/* Components list */}
      <div className="max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-gray-400">Loading components...</p>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <p className="text-gray-500">No components found</p>
          </div>
        ) : (
          filteredComponents.map((component, categoryIndex) => (
            <div key={component.category} className="mb-4">
              <div className="bg-gray-750 p-3 rounded-t-lg border-l-4 border-orange-600">
                <h3 className="text-white font-medium flex items-center">
                  {getCategoryIcon(component.category)}
                  <span className="ml-2">{component.category}</span>
                </h3>
              </div>
              
              <div className="bg-gray-700 rounded-b-lg overflow-hidden">
                {/* Brand section */}
                <div className="p-2">
                  <div 
                    className="flex justify-between items-center p-2 hover:bg-gray-650 cursor-pointer rounded"
                    onClick={() => toggleBrand(categoryIndex, component.brand)}
                  >
                    <span className="text-orange-200 font-medium">{component.brand}</span>
                    {expandedBrands[`${categoryIndex}-${component.brand}`] ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  
                  {/* Models list */}
                  {expandedBrands[`${categoryIndex}-${component.brand}`] && (
                    <div className="pl-4">
                      {component.models.map((model, modelIndex) => (
                        <div 
                          key={model.model}
                          className="flex justify-between items-center p-2 hover:bg-gray-600 rounded cursor-pointer group"
                          onClick={() => handleAddComponent(component, model)}
                        >
                          <div>
                            <div className="text-white">{model.model}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {model.warranty} | HSN: {model["HSN/SAC"]}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-green-400">₹{model.sale_with_GST.toLocaleString()}</span>
                            <button className="text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlusCircle className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ComponentBrowser;