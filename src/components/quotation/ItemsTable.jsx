import React, { useState, useEffect, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { ShoppingCart, Plus, Trash2, Edit, X, Save, ChevronsUpDown, Search } from 'lucide-react';

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
  
  // Start editing an item
  const handleEditStart = (item) => {
    setEditingItemId(item.id);
    setEditData({
      category: item.category,
      brand: item.brand,
      model: item.model,
      hsn_sac: item.hsn_sac,
      warranty: item.warranty,
      quantity: item.quantity,
      purchase_with_gst: item.purchase_with_gst,
      sale_with_gst: item.sale_with_gst,
      gst_percentage: item.gst_percentage
    });
  };
  
  // Save edited item
  const handleSaveEdit = () => {
    try {
      // Validate required fields
      if (!editData.category || !editData.brand || !editData.model || !editData.quantity) {
        throw new Error('Category, Brand, Model, and Quantity are required');
      }
      
      // Validate numeric fields
      if (isNaN(editData.quantity) || editData.quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }
      
      if (isNaN(editData.purchase_with_gst) || editData.purchase_with_gst <= 0) {
        throw new Error('Purchase price must be a positive number');
      }
      
      if (isNaN(editData.sale_with_gst) || editData.sale_with_gst <= 0) {
        throw new Error('Sale price must be a positive number');
      }
      
      if (isNaN(editData.gst_percentage) || editData.gst_percentage < 0) {
        throw new Error('GST percentage must be a non-negative number');
      }
      
      // Update the item
      updateItem(editingItemId, {
        ...editData,
        quantity: Number(editData.quantity),
        purchase_with_gst: Number(editData.purchase_with_gst),
        sale_with_gst: Number(editData.sale_with_gst),
        gst_percentage: Number(editData.gst_percentage)
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
  
  // Update purchase price without GST when purchase price with GST changes
  const handlePurchaseWithGSTChange = (e) => {
    const withGst = parseFloat(e.target.value);
    if (!isNaN(withGst)) {
      setEditData(prev => ({
        ...prev,
        purchase_with_gst: withGst
      }));
    }
  };
  
  // Update purchase price with GST when purchase price without GST changes
  const handlePurchaseWithoutGSTChange = (e) => {
    const withoutGst = parseFloat(e.target.value);
    if (!isNaN(withoutGst)) {
      const withGst = calculatePriceWithGST(withoutGst, editData.gst_percentage);
      setEditData(prev => ({
        ...prev,
        purchase_with_gst: withGst
      }));
    }
  };
  
  // Update sale price without GST when sale price with GST changes
  const handleSaleWithGSTChange = (e) => {
    const withGst = parseFloat(e.target.value);
    if (!isNaN(withGst)) {
      setEditData(prev => ({
        ...prev,
        sale_with_gst: withGst
      }));
    }
  };
  
  // Update sale price with GST when sale price without GST changes
  const handleSaleWithoutGSTChange = (e) => {
    const withoutGst = parseFloat(e.target.value);
    if (!isNaN(withoutGst)) {
      const withGst = calculatePriceWithGST(withoutGst, editData.gst_percentage);
      setEditData(prev => ({
        ...prev,
        sale_with_gst: withGst
      }));
    }
  };

  // Handle product search
  const handleProductSearch = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    if (searchValue.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Search through all components for matches
    const results = [];
    const term = searchValue.toLowerCase();

    if (componentsData && Array.isArray(componentsData)) {
      componentsData.forEach(category => {
        if (category.models && Array.isArray(category.models)) {
          category.models.forEach(model => {
            if (
              model.model.toLowerCase().includes(term) ||
              category.brand.toLowerCase().includes(term) ||
              category.category.toLowerCase().includes(term)
            ) {
              results.push({
                id: `${category.category}-${category.brand}-${model.model}`,
                category: category.category,
                brand: category.brand,
                model: model.model,
                hsn_sac: model["HSN/SAC"],
                warranty: model.warranty,
                purchase_with_gst: model.purchase_with_GST,
                sale_with_gst: model.sale_with_GST,
                gst_percentage: GST_RATE
              });
            }
          });
        }
      });
    }
    
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
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setSuccessMessage(`${item.model} added to quotation`);
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <ShoppingCart className="mr-2 h-5 w-5 text-orange-500" />
          Selected Items
        </h2>
      </div>
      
      {/* Product Search Field */}
      <div className="mb-4 relative">
        <div className="flex items-center bg-gray-700 border border-gray-600 rounded-lg overflow-hidden">
          <Search className="mx-3 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={handleProductSearch}
            placeholder="Search for products to add (model, brand, category)..."
            className="w-full bg-transparent border-none px-0 py-2 text-white focus:outline-none"
          />
        </div>
        
        {/* Search Results Dropdown */}
        {showSearchResults && (
          <div className="absolute z-20 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            <ul className="py-1">
              {searchResults.map(item => (
                <li 
                  key={item.id} 
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleAddItemFromSearch(item)}
                >
                  <div className="flex justify-between">
                    <div>
                      <span className="text-white font-medium">{item.model}</span>
                      <span className="text-gray-400 ml-2">{item.category}</span>
                    </div>
                    <div className="text-green-500">₹{item.sale_with_gst.toLocaleString()}</div>
                  </div>
                  <div className="text-gray-500 text-sm">
                    {item.brand} • {item.warranty}
                  </div>
                </li>
              ))}
            </ul>
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
                  Total
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
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <input
                        type="number"
                        name="quantity"
                        value={editData.quantity}
                        onChange={handleEditChange}
                        min="1"
                        className="w-16 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-white">{item.quantity}</span>
                    )}
                  </td>
                  
                  {/* Purchase price without GST */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">₹</span>
                        <input
                          type="number"
                          name="purchase_without_gst"
                          value={calculatePriceWithoutGST(editData.purchase_with_gst, editData.gst_percentage).toFixed(2)}
                          onChange={handlePurchaseWithoutGSTChange}
                          className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-300">
                        ₹{calculatePriceWithoutGST(item.purchase_with_gst, item.gst_percentage).toFixed(2)}
                      </span>
                    )}
                  </td>
                  
                  {/* Purchase price with GST */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">₹</span>
                        <input
                          type="number"
                          name="purchase_with_gst"
                          value={editData.purchase_with_gst}
                          onChange={handlePurchaseWithGSTChange}
                          className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-300">₹{item.purchase_with_gst.toFixed(2)}</span>
                    )}
                  </td>
                  
                  {/* Sale price without GST */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">₹</span>
                        <input
                          type="number"
                          name="sale_without_gst"
                          value={calculatePriceWithoutGST(editData.sale_with_gst, editData.gst_percentage).toFixed(2)}
                          onChange={handleSaleWithoutGSTChange}
                          className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-300">
                        ₹{calculatePriceWithoutGST(item.sale_with_gst, item.gst_percentage).toFixed(2)}
                      </span>
                    )}
                  </td>
                  
                  {/* Sale price with GST */}
                  <td className="px-3 py-4 whitespace-nowrap">
                    {editingItemId === item.id ? (
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-1">₹</span>
                        <input
                          type="number"
                          name="sale_with_gst"
                          value={editData.sale_with_gst}
                          onChange={handleSaleWithGSTChange}
                          className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-white">₹{item.sale_with_gst.toFixed(2)}</span>
                    )}
                  </td>
                  
                  {/* Total (Sale price with GST × Quantity) */}
                  <td className="px-3 py-4 whitespace-nowrap text-white font-medium">
                    ₹{(item.sale_with_gst * item.quantity).toFixed(2)}
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
                          title="Edit"
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