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
    <div style={{ 
      minHeight: '100vh',
      padding: '30px 20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '35px',
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(255, 107, 157, 0.15)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fff5f9 100%)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '45px' }}>🍭</div>
          <div>
            <h1 style={{ 
              margin: 0,
              color: '#ff6b9d',
              fontSize: '36px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #ff8fab 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Sweet Inventory
            </h1>
            <p style={{ margin: '5px 0 0 0', color: '#718096', fontSize: '14px', fontWeight: '500' }}>Manage your delicious treats 🍬</p>
          </div>
        </div>
        <button 
          onClick={logoutUser}
          style={{
            padding: '12px 24px',
            backgroundColor: '#ffffff',
            color: '#ff6b9d',
            border: '2px solid #ff6b9d',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255, 107, 157, 0.2)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#ff6b9d';
            e.target.style.color = '#ffffff';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 157, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.color = '#ff6b9d';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 157, 0.2)';
          }}
        >
          🚪 Sign Out
        </button>
      </div>

      {/* Create Sweet Form - Only show for admin users */}
      {/* Note: The form will handle 403 errors gracefully if non-admin tries to use it */}
      <CreateSweetForm onSweetCreated={handleNewSweetCreated} />

      {/* Search Form */}
      <div style={{ 
        marginBottom: '25px', 
        padding: '35px', 
        borderRadius: '20px', 
        backgroundColor: '#ffffff',
        boxShadow: '0 10px 40px rgba(255, 107, 157, 0.15)',
        background: 'linear-gradient(145deg, #ffffff 0%, #fff9fc 100%)'
      }}>
        <h2 style={{ 
          marginTop: '0',
          marginBottom: '25px',
          color: '#ff6b9d',
          fontSize: '26px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          🔍 Search & Filter
        </h2>
        <form onSubmit={fetchSweets}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
            <div>
              <label htmlFor="searchTerm" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Name Search:</label>
              <input
                type="text"
                id="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                style={{ 
                  width: '100%', 
                  padding: '14px 18px', 
                  border: '3px double #8b7355', 
                  borderRadius: '0',
                  fontSize: '16px',
                  fontFamily: 'Georgia, serif',
                  backgroundColor: '#ffffff',
                  color: '#3d2914',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: 'inset 4px 4px 8px rgba(61, 41, 20, 0.08), 0 0 0 1px rgba(139, 115, 85, 0.2)',
                  letterSpacing: '0.5px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6b5639';
                  e.target.style.borderStyle = 'solid';
                  e.target.style.borderWidth = '3px';
                  e.target.style.backgroundColor = '#fefefe';
                  e.target.style.boxShadow = 'inset 4px 4px 8px rgba(61, 41, 20, 0.1), 0 0 12px rgba(139, 115, 85, 0.4), 0 0 0 2px rgba(139, 115, 85, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#8b7355';
                  e.target.style.borderStyle = 'double';
                  e.target.style.borderWidth = '3px';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = 'inset 4px 4px 8px rgba(61, 41, 20, 0.08), 0 0 0 1px rgba(139, 115, 85, 0.2)';
                }}
              />
            </div>
            
            <div>
              <label htmlFor="minPrice" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Minimum Price:</label>
              <input
                type="number"
                id="minPrice"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min price..."
                step="0.01"
                min="0"
                style={{ 
                  width: '100%', 
                  padding: '14px 18px', 
                  border: '3px double #8b7355', 
                  borderRadius: '0',
                  fontSize: '16px',
                  fontFamily: 'Georgia, serif',
                  backgroundColor: '#ffffff',
                  color: '#3d2914',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: 'inset 4px 4px 8px rgba(61, 41, 20, 0.08), 0 0 0 1px rgba(139, 115, 85, 0.2)',
                  letterSpacing: '0.5px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6b5639';
                  e.target.style.borderStyle = 'solid';
                  e.target.style.borderWidth = '3px';
                  e.target.style.backgroundColor = '#fefefe';
                  e.target.style.boxShadow = 'inset 4px 4px 8px rgba(61, 41, 20, 0.1), 0 0 12px rgba(139, 115, 85, 0.4), 0 0 0 2px rgba(139, 115, 85, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#8b7355';
                  e.target.style.borderStyle = 'double';
                  e.target.style.borderWidth = '3px';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = 'inset 4px 4px 8px rgba(61, 41, 20, 0.08), 0 0 0 1px rgba(139, 115, 85, 0.2)';
                }}
              />
            </div>
            
            <div>
              <label htmlFor="maxPrice" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Maximum Price:</label>
              <input
                type="number"
                id="maxPrice"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max price..."
                step="0.01"
                min="0"
                style={{ 
                  width: '100%', 
                  padding: '14px 18px', 
                  border: '3px double #8b7355', 
                  borderRadius: '0',
                  fontSize: '16px',
                  fontFamily: 'Georgia, serif',
                  backgroundColor: '#ffffff',
                  color: '#3d2914',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: 'inset 4px 4px 8px rgba(61, 41, 20, 0.08), 0 0 0 1px rgba(139, 115, 85, 0.2)',
                  letterSpacing: '0.5px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#6b5639';
                  e.target.style.borderStyle = 'solid';
                  e.target.style.borderWidth = '3px';
                  e.target.style.backgroundColor = '#fefefe';
                  e.target.style.boxShadow = 'inset 4px 4px 8px rgba(61, 41, 20, 0.1), 0 0 12px rgba(139, 115, 85, 0.4), 0 0 0 2px rgba(139, 115, 85, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#8b7355';
                  e.target.style.borderStyle = 'double';
                  e.target.style.borderWidth = '3px';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = 'inset 4px 4px 8px rgba(61, 41, 20, 0.08), 0 0 0 1px rgba(139, 115, 85, 0.2)';
                }}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="submit" 
              style={{ 
                padding: '14px 28px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                color: '#ffffff', 
                border: 'none',
                borderRadius: '16px', 
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
            >
              🔍 Search
            </button>
            <button 
              type="button" 
              onClick={handleReset} 
              style={{ 
                padding: '14px 28px', 
                backgroundColor: '#ffffff', 
                color: '#718096', 
                border: '2px solid #e2e8f0',
                borderRadius: '16px', 
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                letterSpacing: '0.5px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#cbd5e0';
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
            >
              🔄 Reset
            </button>
          </div>
        </form>
      </div>

      {isLoading && (
        <div style={{
          backgroundColor: '#ffffff',
          padding: '60px',
          borderRadius: '20px',
          textAlign: 'center',
          boxShadow: '0 10px 40px rgba(255, 107, 157, 0.15)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍭</div>
          <div style={{ fontSize: '18px', color: '#ff6b9d', fontWeight: '600' }}>Loading your sweets...</div>
        </div>
      )}

      {error && !isLoading && (
        <div style={{ 
          backgroundColor: '#fed7d7',
          color: '#c53030',
          padding: '18px 24px',
          borderRadius: '16px',
          margin: '20px 0',
          border: '2px solid #fc8181',
          fontSize: '15px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(197, 48, 48, 0.15)'
        }}>
          ⚠️ {error}
        </div>
      )}

      {!isLoading && !error && (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(255, 107, 157, 0.15)',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #fff9fc 100%)'
        }}>
          {sweets.length === 0 ? (
            <div style={{
              padding: '80px 20px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍬</div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: '#ff6b9d', marginBottom: '10px' }}>No sweets found</div>
              <div style={{ fontSize: '16px', color: '#718096', marginTop: '8px' }}>Try creating a new sweet or adjusting your search filters ✨</div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px' }}>ID</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px' }}>Name</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px' }}>Category</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px' }}>Price</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px' }}>Quantity</th>
                    <th style={{ padding: '18px 20px', textAlign: 'left', fontWeight: '700', fontSize: '15px', letterSpacing: '0.5px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sweets.map((sweet, index) => (
                    <tr 
                      key={sweet.id} 
                      style={{ 
                        borderBottom: '1px solid #e2e8f0',
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f7fafc',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fff5f9';
                        e.currentTarget.style.transform = 'scale(1.01)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 107, 157, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f7fafc';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <td style={{ padding: '18px 20px', color: '#718096', fontSize: '15px', fontWeight: '600' }}>#{sweet.id}</td>
                      <td style={{ padding: '18px 20px', color: '#2d3748', fontWeight: '600', fontSize: '16px' }}>{sweet.name}</td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{
                          padding: '6px 14px',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                        }}>
                          {sweet.category}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px' }}>
                        <span style={{ 
                          color: '#48bb78', 
                          fontWeight: '700', 
                          fontSize: '16px',
                          background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          ${sweet.price}
                        </span>
                      </td>
                      <td style={{ padding: '18px 20px', color: '#4a5568', fontSize: '15px', fontWeight: '500' }}>{sweet.quantity} units</td>
                      <td style={{ padding: '18px 20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => handleEdit(sweet)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(sweet.id)}
                            style={{
                              padding: '8px 16px',
                              background: 'linear-gradient(135deg, #fc8181 0%, #f56565 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 8px rgba(252, 129, 129, 0.3)'
                            }}
                            onMouseOver={(e) => {
                              e.target.style.transform = 'translateY(-2px)';
                              e.target.style.boxShadow = '0 4px 12px rgba(252, 129, 129, 0.4)';
                            }}
                            onMouseOut={(e) => {
                              e.target.style.transform = 'translateY(0)';
                              e.target.style.boxShadow = '0 2px 8px rgba(252, 129, 129, 0.3)';
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

