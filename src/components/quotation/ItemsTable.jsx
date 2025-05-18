import React, { useState, useEffect, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ShoppingCart, Plus, Trash2, Edit, X, Save, ChevronsUpDown, Search, Filter } from 'lucide-react';

const ItemsTable = ({ setSuccessMessage, setErrorMessage }) => {
  const { 
    items, 
    updateItem, 
    removeItem, 
    calculatePriceWithoutGST,
    calculatePriceWithGST,
    GST_RATE,
    componentsData
  } = useQuotation();
  
  const [editingItemId, setEditingItemId] = useState(null);
  const [editData, setEditData] = useState({});
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    category: true,
    brand: true,
    model: true,
    hsn: true,
    lastDigits: true
  });
  
  // For tracking price changes
  const [itemPrices, setItemPrices] = useState({});
  
  const searchInputRef = useRef(null);
  const searchResultsRef = useRef(null);
  
  // Format number to 2 decimal places
  const formatDecimal = (value) => {
    if (value === undefined || value === null) return '0.00';
    return Number(value).toFixed(2);
  };
  
  // Initialize item prices when items change
  useEffect(() => {
    const newPrices = {};
    items.forEach(item => {
      newPrices[item.id] = {
        purchase_with_gst: item.purchase_with_gst,
        purchase_without_gst: calculatePriceWithoutGST(item.purchase_with_gst, item.gst_percentage),
        sale_with_gst: item.sale_with_gst,
        sale_without_gst: calculatePriceWithoutGST(item.sale_with_gst, item.gst_percentage),
        quantity: item.quantity,
        gst_percentage: item.gst_percentage
      };
    });
    setItemPrices(newPrices);
  }, [items, calculatePriceWithoutGST]);
  
  // Handle clicks outside the search results to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Calculate margin for an item
  const calculateMargin = (item) => {
    const itemPrice = itemPrices[item.id] || {};
    const saleWithoutGST = itemPrice.sale_without_gst || calculatePriceWithoutGST(item.sale_with_gst, item.gst_percentage);
    const purchaseWithoutGST = itemPrice.purchase_without_gst || calculatePriceWithoutGST(item.purchase_with_gst, item.gst_percentage);
    
    return saleWithoutGST - purchaseWithoutGST;
  };
  
  // Start editing an item (for non-price fields)
  const handleEditStart = (item) => {
    setEditingItemId(item.id);
    setEditData({
      category: item.category,
      brand: item.brand,
      model: item.model,
      hsn_sac: item.hsn_sac,
      warranty: item.warranty,
      gst_percentage: item.gst_percentage
    });
  };
  
  // Save edited item
  const handleSaveEdit = () => {
    try {
      // Validate required fields
      if (!editData.category || !editData.brand || !editData.model) {
        throw new Error('Category, Brand, and Model are required');
      }
      
      // Get current item and merge with edits
      const item = items.find(i => i.id === editingItemId);
      if (!item) {
        throw new Error('Item not found');
      }
      
      // Update the item with edited fields while preserving prices
      updateItem(editingItemId, {
        ...item,
        category: editData.category,
        brand: editData.brand,
        model: editData.model,
        hsn_sac: editData.hsn_sac,
        warranty: editData.warranty,
        gst_percentage: Number(editData.gst_percentage || GST_RATE)
      });
      
      // Reset editing state
      setEditingItemId(null);
      setEditData({});
      
      setSuccessMessage('Item updated successfully!');
    } catch (error) {
      setErrorMessage(error.message);
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditData({});
  };
  
  // Handle form field changes while editing
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle price changes for "with GST" prices
  const handlePriceWithGSTChange = (itemId, field, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const gstPercentage = item.gst_percentage;
    const withoutGSTValue = calculatePriceWithoutGST(numValue, gstPercentage);
    const withoutGSTField = field === 'purchase_with_gst' ? 'purchase_without_gst' : 'sale_without_gst';
    
    // Update local state for immediate feedback
    setItemPrices(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: numValue,
        [withoutGSTField]: withoutGSTValue
      }
    }));
    
    // Debounced update to the actual item
    clearTimeout(window.priceUpdateTimeout);
    window.priceUpdateTimeout = setTimeout(() => {
      // Only update the source field that was changed
      const updatedItem = { ...item, [field]: numValue };
      updateItem(itemId, updatedItem);
    }, 500);
  };
  
  // Handle price changes for "without GST" prices
  const handlePriceWithoutGSTChange = (itemId, field, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const gstPercentage = item.gst_percentage;
    const withGSTValue = calculatePriceWithGST(numValue, gstPercentage);
    const withGSTField = field === 'purchase_without_gst' ? 'purchase_with_gst' : 'sale_with_gst';
    
    // Update local state for immediate feedback
    setItemPrices(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: numValue,
        [withGSTField]: withGSTValue
      }
    }));
    
    // Debounced update to the actual item
    clearTimeout(window.priceUpdateTimeout);
    window.priceUpdateTimeout = setTimeout(() => {
      // Convert to the with-GST price for the update
      const updatedItem = { ...item, [withGSTField]: withGSTValue };
      updateItem(itemId, updatedItem);
    }, 500);
  };
  
  // Handle quantity change
  const handleQuantityChange = (itemId, value) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1) return;
    
    // Update local state for immediate feedback
    setItemPrices(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        quantity: numValue
      }
    }));
    
    // Debounced update to the actual item
    clearTimeout(window.quantityUpdateTimeout);
    window.quantityUpdateTimeout = setTimeout(() => {
      const item = items.find(i => i.id === itemId);
      if (item) {
        const updatedItem = { ...item, quantity: numValue };
        updateItem(itemId, updatedItem);
      }
    }, 500);
  };
  
  // Handle remove item
  const handleRemoveItem = (id) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      removeItem(id);
      setSuccessMessage('Item removed successfully!');
    }
  };
  
  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort items
  const sortedItems = [...items].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc' 
      ? aValue - bValue
      : bValue - aValue;
  });

  // Enhanced product search with improved matching and debugging
  const handleProductSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    if (!searchValue || searchValue.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Search through all components for matches
    const results = [];
    const term = searchValue.toLowerCase().trim();
    
    console.log(`Searching for: "${term}" in ${componentsData ? componentsData.length : 0} categories`);
    
    if (componentsData && Array.isArray(componentsData)) {
      componentsData.forEach(category => {
        if (category.models && Array.isArray(category.models)) {
          category.models.forEach(model => {
            // Check for matches in multiple fields
            const modelName = (model.model || '').toLowerCase();
            const brandName = (category.brand || '').toLowerCase();
            const categoryName = (category.category || '').toLowerCase();
            const hsnCode = model["HSN/SAC"] ? model["HSN/SAC"].toString().toLowerCase() : '';
            const warranty = (model.warranty || '').toLowerCase();
            
            // Calculate a match score to prioritize results
            let matchScore = 0;
            let matched = false;
            
            // Apply filters based on user preferences
            if (searchFilters.model) {
              // Main field exact matches (higher score)
              if (modelName === term) {
                matchScore += 100;
                matched = true;
              }
              
              // Partial matches in model
              if (modelName.includes(term)) {
                matchScore += 50;
                matched = true;
              }
            }
            
            if (searchFilters.brand) {
              if (brandName === term) {
                matchScore += 80;
                matched = true;
              }
              
              if (brandName.includes(term)) {
                matchScore += 30;
                matched = true;
              }
            }
            
            if (searchFilters.category) {
              if (categoryName === term) {
                matchScore += 70;
                matched = true;
              }
              
              if (categoryName.includes(term)) {
                matchScore += 20;
                matched = true;
              }
            }
            
            if (searchFilters.hsn && hsnCode) {
              if (hsnCode === term) {
                matchScore += 90;
                matched = true;
              }
              
              if (hsnCode.includes(term)) {
                matchScore += 35;
                matched = true;
              }
            }
            
            // Special case for last 4 digits of model number
            if (searchFilters.lastDigits && term.length >= 2 && term.length <= 4 && /^\d+$/.test(term)) {
              if (modelName.endsWith(term)) {
                matchScore += 60;
                matched = true;
              }
            }
            
            // If warranty includes the term
            if (warranty.includes(term)) {
              matchScore += 10;
              matched = true;
            }
            
            // Check for product code format searches
            // Format: Brand-Model, Category-Brand, etc.
            if (term.includes('-')) {
              const [part1, part2] = term.split('-').map(p => p.trim());
              
              if (
                (brandName.includes(part1) && modelName.includes(part2)) ||
                (categoryName.includes(part1) && brandName.includes(part2))
              ) {
                matchScore += 60;
                matched = true;
              }
            }
            
            // If any match was found, add to results with score
            if (matched) {
              results.push({
                id: `${category.category}-${category.brand}-${model.model}`,
                category: category.category,
                brand: category.brand,
                model: model.model,
                hsn_sac: model["HSN/SAC"],
                warranty: model.warranty,
                purchase_with_gst: model.purchase_with_GST || 0,
                sale_with_gst: model.sale_with_GST || 0,
                gst_percentage: GST_RATE,
                matchScore: matchScore // Include match score for sorting
              });
            }
          });
        }
      });
    }
    
    // Sort results by match score (highest first)
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  // Add item from search results
  const handleAddItemFromSearch = (item) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
      quantity: 1
    };
    
    updateItem(newItem.id, newItem);
    setSuccessMessage(`${item.model} added to quotation`);
  };

  // Toggle advanced search options
  const toggleAdvancedSearch = () => {
    setAdvancedSearch(!advancedSearch);
  };
  
  // Update search filters
  const handleFilterChange = (filter) => {
    setSearchFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5 text-orange-500" />
          Selected Items
        </h2>
      </div>
      
      {/* Product Search Field with Advanced Options */}
      <div className="mb-4 relative">
        <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
          <Search className="mx-3 h-5 w-5 text-gray-400" />
          <input 
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleProductSearch}
            placeholder="Search for products (model, brand, category, HSN code, last digits)..."
            className="w-full bg-transparent border-none px-0 py-2 text-white focus:outline-none"
            onFocus={() => {
              // Show search results if there's a search term
              if (searchTerm.trim() !== '') {
                handleProductSearch({ target: { value: searchTerm } });
                setShowSearchResults(true);
              }
            }}
          />
          <button 
            onClick={toggleAdvancedSearch}
            className={`px-3 py-2 ${advancedSearch ? 'text-orange-500' : 'text-gray-400'} hover:text-orange-400`}
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
        
        {/* Advanced Search Options */}
        {advancedSearch && (
          <div className="mt-2 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm">
            <div className="font-medium mb-2">Search In:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={searchFilters.model}
                  onChange={() => handleFilterChange('model')}
                  className="mr-2 accent-orange-500"
                />
                Model Names
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={searchFilters.brand}
                  onChange={() => handleFilterChange('brand')}
                  className="mr-2 accent-orange-500"
                />
                Brands
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={searchFilters.category}
                  onChange={() => handleFilterChange('category')}
                  className="mr-2 accent-orange-500"
                />
                Categories
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={searchFilters.hsn}
                  onChange={() => handleFilterChange('hsn')}
                  className="mr-2 accent-orange-500"
                />
                HSN/SAC Codes
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={searchFilters.lastDigits}
                  onChange={() => handleFilterChange('lastDigits')}
                  className="mr-2 accent-orange-500"
                />
                Last Digits
              </label>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Tip: Use hyphens to combine searches, e.g., "HP-Pavilion" or "RAM-16GB"
            </div>
          </div>
        )}
        
        {/* Search Results Dropdown - ALWAYS visible when there are results */}
        {showSearchResults && (
          <div 
            ref={searchResultsRef}
            className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-72 overflow-auto"
          >
            {searchResults.length === 0 ? (
              <div className="px-4 py-3 text-gray-400">No matching products found</div>
            ) : (
              <ul className="py-1">
                {searchResults.map(item => (
                  <li 
                    key={item.id} 
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleAddItemFromSearch(item)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="text-white font-medium">{item.model}</span>
                          <span className="text-gray-400 text-sm ml-2">({item.category})</span>
                        </div>
                        <div className="text-gray-500 text-sm flex flex-wrap gap-2">
                          <span>{item.brand}</span>
                          {item.warranty && <span>• {item.warranty}</span>}
                          {item.hsn_sac && <span>• HSN: {item.hsn_sac}</span>}
                        </div>
                      </div>
                      <div className="text-green-500 font-medium ml-4">₹{formatDecimal(item.sale_with_gst)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="bg-gray-700 border border-gray-600 rounded-lg p-6 text-center my-4">
          <p className="text-gray-400 mb-2">No items added yet</p>
          <p className="text-gray-500 text-sm">
            Use the search box above or the component browser to add items to this quotation
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 mb-4">
            <thead>
              <tr>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('category')}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === 'category' && (
                      <ChevronsUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('brand')}
                >
                  <div className="flex items-center">
                    Brand
                    {sortField === 'brand' && (
                      <ChevronsUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('model')}
                >
                  <div className="flex items-center">
                    Model
                    {sortField === 'model' && (
                      <ChevronsUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  HSN/SAC
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Warranty
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <div className="flex items-center">
                    Qty
                    {sortField === 'quantity' && (
                      <ChevronsUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="whitespace-nowrap">Purchase (Ex. GST)</div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="whitespace-nowrap">Purchase (Inc. GST)</div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="whitespace-nowrap">Sale (Ex. GST)</div>
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sale_with_gst')}
                >
                  <div className="flex items-center whitespace-nowrap">
                    Sale (Inc. GST)
                    {sortField === 'sale_with_gst' && (
                      <ChevronsUpDown className="ml-1 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <div className="whitespace-nowrap">Margin</div>
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {sortedItems.map((item) => (
                <tr key={item.id} className={editingItemId === item.id ? 'bg-gray-700' : 'hover:bg-gray-750'}>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        name="category"
                        value={editData.category}
                        onChange={handleEditChange}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{item.category}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        name="brand"
                        value={editData.brand}
                        onChange={handleEditChange}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{item.brand}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        name="model"
                        value={editData.model}
                        onChange={handleEditChange}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{item.model}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        name="hsn_sac"
                        value={editData.hsn_sac}
                        onChange={handleEditChange}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-300">{item.hsn_sac}</span>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="text"
                        name="warranty"
                        value={editData.warranty}
                        onChange={handleEditChange}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-300">{item.warranty}</span>
                    )}
                  </td>
                  
                  {/* Always editable Quantity */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="1"
                      value={itemPrices[item.id]?.quantity || item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      className="w-16 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </td>
                  
                  {/* Purchase price without GST - Normal editable with rupee symbol */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">₹</span>
                      <input
                        type="text"
                        value={formatDecimal(itemPrices[item.id]?.purchase_without_gst || calculatePriceWithoutGST(item.purchase_with_gst, item.gst_percentage))}
                        onChange={(e) => handlePriceWithoutGSTChange(item.id, 'purchase_without_gst', e.target.value)}
                        className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </td>
                  
                  {/* Purchase price with GST - Normal editable with rupee symbol */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">₹</span>
                      <input
                        type="text"
                        value={formatDecimal(itemPrices[item.id]?.purchase_with_gst || item.purchase_with_gst)}
                        onChange={(e) => handlePriceWithGSTChange(item.id, 'purchase_with_gst', e.target.value)}
                        className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </td>
                  
                  {/* Sale price without GST - Normal editable with rupee symbol */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">₹</span>
                      <input
                        type="text"
                        value={formatDecimal(itemPrices[item.id]?.sale_without_gst || calculatePriceWithoutGST(item.sale_with_gst, item.gst_percentage))}
                        onChange={(e) => handlePriceWithoutGSTChange(item.id, 'sale_without_gst', e.target.value)}
                        className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </td>
                  
                  {/* Sale price with GST - Normal editable with rupee symbol */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-gray-400 mr-1">₹</span>
                      <input
                        type="text"
                        value={formatDecimal(itemPrices[item.id]?.sale_with_gst || item.sale_with_gst)}
                        onChange={(e) => handlePriceWithGSTChange(item.id, 'sale_with_gst', e.target.value)}
                        className="w-20 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                      />
                    </div>
                  </td>
                  
                  {/* Margin (Sale without GST - Purchase without GST) */}
                  <td className="px-3 py-4 whitespace-nowrap text-green-500 font-medium">
                    ₹{formatDecimal(calculateMargin(item))}
                  </td>
                  
                  {/* Actions */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-500 hover:text-green-400"
                          title="Save"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-500 hover:text-red-400"
                          title="Cancel"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStart(item)}
                          className="text-blue-500 hover:text-blue-400"
                          title="Edit other fields"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-400"
                          title="Remove"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Empty state message */}
      {items.length === 0 && (
        <div className="text-center mt-4">
          <Plus className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <p className="text-gray-500">
            Search for products above or browse components to add them to your quotation
          </p>
        </div>
      )}
    </div>
  );
};

export default ItemsTable;