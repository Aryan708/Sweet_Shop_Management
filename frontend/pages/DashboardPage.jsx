import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';
import CreateSweetForm from '../components/CreateSweetForm';
import UpdateSweetModal from '../components/UpdateSweetModal';

const DashboardPage = () => {
  const { authToken, logoutUser } = useAuth();
  
  // State management
  const [sweets, setSweets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search state management
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Modal state management
  const [editingSweet, setEditingSweet] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Data fetching function
  const fetchSweets = async (e) => {
    // Prevent default form submission if called from form
    if (e) {
      e.preventDefault();
    }

    try {
      setIsLoading(true);
      setError(null);

      // Determine URL based on search parameters
      let url = '';
      const hasSearchParams = searchTerm.trim() || minPrice.trim() || maxPrice.trim();

      if (!hasSearchParams) {
        // All search fields are empty, use regular list endpoint
        url = `${API_BASE_URL}/sweets/`;
      } else {
        // Build query string with non-empty parameters
        const params = new URLSearchParams();
        
        if (searchTerm.trim()) {
          params.append('name', searchTerm.trim());
        }
        if (minPrice.trim()) {
          params.append('min_price', minPrice.trim());
        }
        if (maxPrice.trim()) {
          params.append('max_price', maxPrice.trim());
        }
        
        url = `${API_BASE_URL}/sweets/search/?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setSweets(response.data);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);

      // Handle authentication errors (401/403) - token expired or invalid
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        // Automatically logout user and redirect to login
        logoutUser();
        return;
      }

      // Handle other errors
      if (err.response) {
        // Server responded with error status
        const errorData = err.response.data;
        setError(
          errorData?.detail || errorData?.message || 'Failed to fetch sweets. Please try again.'
        );
      } else if (err.request) {
        // Request was made but no response received (network error)
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Reset search and fetch all sweets
  const handleReset = (e) => {
    e.preventDefault();
    // Clear all search fields
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    // Since fetchSweets reads from state, we need to ensure state is cleared
    // Use a small delay to ensure state updates before calling fetchSweets
    // Alternatively, we could pass empty params directly, but keeping it consistent
    setTimeout(() => {
      fetchSweets();
    }, 10);
  };

  // Handle new sweet created - refresh the sweets list
  const handleNewSweetCreated = () => {
    fetchSweets();
  };

  // Handle sweet updated - refresh the sweets list
  const handleSweetUpdated = () => {
    fetchSweets();
  };

  // Handle edit button click - open modal with sweet data
  const handleEdit = (sweet) => {
    setEditingSweet(sweet);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSweet(null);
  };

  // Handle delete sweet
  const handleDelete = async (sweetId) => {
    // Client-side confirmation
    const confirmed = window.confirm('Are you sure you want to delete this sweet? This action cannot be undone.');
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/sweets/${sweetId}/`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Success handling - status 204 No Content
      if (response.status === 204) {
        // Refresh the sweets list
        fetchSweets();
      }
    } catch (err) {
      // Handle authentication errors (401) - token expired or invalid
      if (err.response && err.response.status === 401) {
        logoutUser();
        return;
      }

      // Handle permission errors (403) - Admin only
      if (err.response && err.response.status === 403) {
        setError('Permission denied: Only Admin users can delete sweets.');
        return;
      }

      // Handle other errors
      if (err.response) {
        const errorData = err.response.data;
        setError(
          errorData?.detail || errorData?.message || 'Failed to delete sweet. Please try again.'
        );
      } else if (err.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  // Fetch sweets on component mount
  useEffect(() => {
    if (authToken) {
      fetchSweets();
    } else {
      // If no token, logout (should redirect to login)
      logoutUser();
    }
  }, []); // Empty dependency array - only run on mount

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Sweet Inventory Dashboard</h1>
        <button onClick={logoutUser}>Logout</button>
      </div>

      {/* Create Sweet Form */}
      <CreateSweetForm onSweetCreated={handleNewSweetCreated} />

      {/* Search Form */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
        <h2 style={{ marginTop: '0' }}>Search & Filter</h2>
        <form onSubmit={fetchSweets}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label htmlFor="searchTerm" style={{ display: 'block', marginBottom: '5px' }}>Name Search:</label>
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
            
            <div>
              <label htmlFor="minPrice" style={{ display: 'block', marginBottom: '5px' }}>Minimum Price:</label>
              <input
                type="number"
                id="minPrice"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min price..."
                step="0.01"
                min="0"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
            
            <div>
              <label htmlFor="maxPrice" style={{ display: 'block', marginBottom: '5px' }}>Maximum Price:</label>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max price..."
                step="0.01"
                min="0"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
              Search
            </button>
            <button type="button" onClick={handleReset} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
              Reset
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div>Loading sweets...</div>
      )}

      {error && !isLoading && (
        <div style={{ color: 'red', margin: '20px 0' }}>
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div>
          {sweets.length === 0 ? (
            <div>No sweets found.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f0f0f0' }}>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Category</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Price</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Quantity</th>
                  <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sweets.map((sweet) => (
                  <tr key={sweet.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sweet.id}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sweet.name}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sweet.category}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>${sweet.price}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{sweet.quantity}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleEdit(sweet)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(sweet.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Update Sweet Modal */}
      <UpdateSweetModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        sweetData={editingSweet}
        onSweetUpdated={handleSweetUpdated}
      />
    </div>
  );
};

export default DashboardPage;

