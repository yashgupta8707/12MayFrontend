import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, X, Check, FileText, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const PartyManagement = () => {
  // State for parties list and form handling
  const [parties, setParties] = useState([]);
  const [filteredParties, setFilteredParties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [editingId, setEditingId] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch parties on component mount
  useEffect(() => {
    fetchParties();
  }, []);

  // Update filtered parties when search term or parties change
  useEffect(() => {
    if (!Array.isArray(parties)) {
      setFilteredParties([]);
      return;
    }

    if (searchTerm === "") {
      setFilteredParties(parties);
    } else {
      const filtered = parties.filter(
        (party) =>
          (party.partyId && party.partyId.toString().includes(searchTerm)) ||
          (party.name &&
            party.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (party.phone && party.phone.includes(searchTerm)) ||
          (party.address &&
            party.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredParties(filtered);
    }
  }, [searchTerm, parties]);

  // Fetch all parties from the API
  const fetchParties = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/parties", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch parties: ${response.status} ${response.statusText}`
        );
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server did not return JSON. Received: " + contentType);
      }

      const data = await response.json();
      const partiesArray = Array.isArray(data) ? data : [];

      setParties(partiesArray);
      setFilteredParties(partiesArray);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching parties:", err);
      setError(err.message || "Failed to load parties");
      setParties([]);
      setFilteredParties([]);
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new party
  const handleAddParty = async (e) => {
    e.preventDefault();
    try {
      setError("");
      // Client-side validation
      if (!formData.name || !formData.phone) {
        setError("Name and Phone are required fields");
        return;
      }

      console.log("Sending party data:", JSON.stringify(formData));
      
      const response = await fetch("http://localhost:5000/api/parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });

      // For non-2xx responses, try to get error details
      if (!response.ok) {
        let errorMessage = "Failed to create party";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use text content
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Party added successfully:", result);
      
      // Refresh parties list and reset form
      await fetchParties();
      setFormData({ name: "", phone: "", address: "" });
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding party:", err);
      setError(err.message || "Failed to create party");
    }
  };

  // Edit an existing party
  const handleEditParty = async (e) => {
    e.preventDefault();
    try {
      setError("");
      // Validate required fields
      if (!editingParty.name || !editingParty.phone) {
        setError("Name and Phone are required fields");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/parties/${editingParty._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(editingParty),
        }
      );

      if (!response.ok) {
        let errorMessage = "Failed to update party";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Refresh parties list and close modal
      await fetchParties();
      setShowEditModal(false);
      setEditingParty(null);
      setEditingId(false);
    } catch (err) {
      console.error("Error updating party:", err);
      setError(err.message || "Failed to update party");
    }
  };

  // Delete a party
  const handleDeleteParty = async (id) => {
    if (window.confirm("Are you sure you want to delete this party?")) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/parties/${id}`,
          {
            method: "DELETE",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          let errorMessage = "Failed to delete party";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch (parseError) {
            errorMessage = await response.text() || errorMessage;
          }
          throw new Error(errorMessage);
        }

        await fetchParties();
      } catch (err) {
        console.error("Error deleting party:", err);
        setError(err.message || "Failed to delete party");
      }
    }
  };

  // Open edit modal with party data
  const openEditModal = (party) => {
    setEditingParty({ ...party });
    setShowEditModal(true);
  };

  // Clear error message
  const clearError = () => {
    setError("");
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Search and Add Button */}
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search parties by ID, name, phone or address..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            className="bg-orange-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-orange-700 transition-colors"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Party
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
            <button
              className="absolute top-0 right-0 p-2"
              onClick={clearError}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Parties Table */}
        <div className="bg-white shadow-md rounded-md overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    Loading parties...
                  </td>
                </tr>
              ) : error && filteredParties.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-red-600"
                  >
                    Error: {error}
                  </td>
                </tr>
              ) : !Array.isArray(filteredParties) ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    Invalid data format. Please refresh.
                  </td>
                </tr>
              ) : filteredParties.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    No parties found
                  </td>
                </tr>
              ) : (
                filteredParties.map((party) => (
                  <tr
                    key={party._id || `party-${Math.random()}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {party.partyId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {party.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {party.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {party.address || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      <Link
                        to={`/parties/${party._id}`}
                        className="text-gray-600 hover:text-gray-800"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => openEditModal(party)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleDeleteParty(party._id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/quotations/${party._id}`}
                        className="text-green-600 hover:text-green-800"
                        title="Create Quotation"
                      >
                        <FileText className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Party Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Party</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => setShowAddModal(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleAddParty}>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="phone"
                >
                  Phone *
                </label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="address"
                >
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Add Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Party Modal */}
      {showEditModal && editingParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit Party</h2>
              <button
                className="text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingParty(null);
                  setEditingId(false);
                }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditParty}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Party ID
                </label>
                <div className="flex items-center">
                  <div className="flex-grow px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {editingParty.partyId || "N/A"}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="edit-name"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="edit-name"
                  value={editingParty.name}
                  onChange={(e) =>
                    setEditingParty({ ...editingParty, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="edit-phone"
                >
                  Phone *
                </label>
                <input
                  type="text"
                  id="edit-phone"
                  value={editingParty.phone}
                  onChange={(e) =>
                    setEditingParty({ ...editingParty, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="edit-address"
                >
                  Address
                </label>
                <textarea
                  id="edit-address"
                  value={editingParty.address || ""}
                  onChange={(e) =>
                    setEditingParty({
                      ...editingParty,
                      address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingParty(null);
                    setEditingId(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Update Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyManagement;