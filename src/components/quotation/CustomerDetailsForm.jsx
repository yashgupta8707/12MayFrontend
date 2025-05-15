import React, { useState, useEffect, useRef } from 'react';
import { useQuotation } from '../../context/QuotationContext';
import { User, Phone, MapPin, Search } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { debounce } from '../../utils/debounce';

const CustomerDetailsForm = () => {
  const { selectedParty, setSelectedParty } = useQuotation();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParties, setFilteredParties] = useState([]);
  const [showPartyList, setShowPartyList] = useState(false);
  const [error, setError] = useState('');
  
  const { partyId } = useParams();
  
  // Use refs to prevent infinite loops
  const fetchingPartiesRef = useRef(false);
  const fetchPartyIdRef = useRef(null);
  
  // Debounced search function to avoid too many filter operations
  const debouncedSearch = useRef(
    debounce((term, partiesList) => {
      if (term.trim() === '') {
        setFilteredParties(partiesList);
      } else {
        const filtered = partiesList.filter(party => {
          const searchTerm = term.toLowerCase();
          return (
            (party.name && party.name.toLowerCase().includes(searchTerm)) ||
            (party.phone && party.phone.includes(searchTerm)) ||
            (party.address && party.address.toLowerCase().includes(searchTerm)) ||
            (party.partyId && party.partyId.toString().includes(searchTerm))
          );
        });
        setFilteredParties(filtered);
      }
    }, 300)
  ).current;
  
  // Filter parties based on search term - using debounce
  useEffect(() => {
    debouncedSearch(searchTerm, parties);
  }, [searchTerm, parties, debouncedSearch]);
  
  // Fetch parties when component mounts
  useEffect(() => {
    const fetchParties = async () => {
      // Prevent duplicate fetches
      if (fetchingPartiesRef.current) {
        return;
      }
      
      try {
        fetchingPartiesRef.current = true;
        setLoading(true);
        setError('');
        
        console.log('Fetching all parties...');
        
        // const response = await fetch('https://server12may.onrender.com/api/parties', {
        const response = await fetch('http://localhost:5000/api/parties', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        // First check if the response is OK
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch parties: ${response.status} ${response.statusText}`);
        }
        
        // Check the content type to make sure it's JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server did not return JSON. Received: ' + contentType);
        }
        
        const data = await response.json();
        const partiesArray = Array.isArray(data) ? data : [];
        
        console.log(`Retrieved ${partiesArray.length} parties`);
        
        setParties(partiesArray);
        setFilteredParties(partiesArray);
        
      } catch (error) {
        console.error('Error fetching parties:', error);
        setError('Failed to load parties. Please try again later.');
      } finally {
        setLoading(false);
        fetchingPartiesRef.current = false;
      }
    };
    
    fetchParties();
  }, []); // Empty dependency array - only run once
  
  // Enhanced version of fetchPartyById function
const fetchPartyById = async (id) => {
  // Prevent duplicate fetches
  if (fetchPartyIdRef.current === id || fetchingPartiesRef.current) {
    console.log(`Skipping duplicate party fetch for ID: ${id}`);
    return;
  }
  
  try {
    fetchingPartiesRef.current = true;
    fetchPartyIdRef.current = id;
    setLoading(true);
    setError('');
    
    console.log(`Fetching specific party with ID: ${id}`);
    
    // Use a variable to store your base URL for easier switching
    const BASE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://server12may.onrender.com' 
      : 'http://localhost:5000';
    
    const response = await fetch(`${BASE_URL}/api/parties/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    // First check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response (${response.status}):`, errorText);
      throw new Error(`Failed to fetch party: ${response.status} ${response.statusText}`);
    }
    
    // Check the content type to make sure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      throw new Error('Server did not return JSON. Received: ' + contentType);
    }
    
    const party = await response.json();
    console.log('Received party data:', party);
    
    // Only update if we don't already have this party or it's different
    if (!selectedParty || selectedParty._id !== party._id) {
      setSelectedParty(party);
    }
    
  } catch (error) {
    console.error('Error fetching party by ID:', error);
    setError(`Failed to load party details: ${error.message}`);
  } finally {
    setLoading(false);
    fetchingPartiesRef.current = false;
  }
};
  
  // Handle party selection
  const handleSelectParty = (party) => {
    setSelectedParty(party);
    setShowPartyList(false);
    setSearchTerm('');
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowPartyList(true);
  };
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-5 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <User className="mr-2 h-5 w-5 text-orange-500" />
          Customer Details
        </h2>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-900 bg-opacity-30 border border-red-800 p-3 rounded-lg mb-4 text-red-200">
          {error}
        </div>
      )}
      
      {/* Search for party */}
      <div className="mb-6 relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search for a party by name, phone, or address..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            onFocus={() => setShowPartyList(true)}
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {/* Dropdown for party selection */}
        {showPartyList && (
          <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-400">Loading parties...</div>
            ) : filteredParties.length === 0 ? (
              <div className="p-3 text-center text-gray-400">No parties found</div>
            ) : (
              <ul className="py-1">
                {filteredParties.map((party) => (
                  <li
                    key={party._id}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer transition-colors duration-150"
                    onClick={() => handleSelectParty(party)}
                  >
                    <div className="font-medium text-white">{party.partyId}</div>
                    <div className="font-medium text-white">{party.name}</div>
                    <div className="text-sm text-gray-400 flex items-center mt-1">
                      <Phone className="h-3 w-3 mr-1" /> {party.phone}
                    </div>
                    {party.address && (
                      <div className="text-sm text-gray-400 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" /> {party.address}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      
      {/* Display selected party details */}
      {selectedParty ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Party ID</label>
            <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
              {selectedParty.id}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
              {selectedParty.name}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone
            </label>
            <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
              {selectedParty.phone}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-1">
              <MapPin className="inline h-4 w-4 mr-1" />
              Address
            </label>
            <div className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
              {selectedParty.address || 'N/A'}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 text-center">
          <p className="text-gray-400 mb-2">No party selected</p>
          <p className="text-gray-500 text-sm">
            Search and select a party from the field above to create a quotation
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerDetailsForm;