import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';

const UpdateSweetModal = ({ isOpen, onClose, sweetData, onSweetUpdated }) => {
  const { authToken, logoutUser } = useAuth();
  
  // Form state management - initialized from sweetData prop
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update form fields when sweetData changes
  useEffect(() => {
    if (sweetData) {
      setName(sweetData.name || '');
      setCategory(sweetData.category || '');
      setPrice(sweetData.price || '');
      setQuantity(sweetData.quantity?.toString() || '');
    }
  }, [sweetData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!sweetData || !sweetData.id) {
      setError('Invalid sweet data. Cannot update.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${API_BASE_URL}/sweets/${sweetData.id}/`,
        {
          name: name.trim(),
          category: category,
          price: price,
          quantity: parseInt(quantity, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Success handling - status 200 OK
      if (response.status === 200) {
        // Call the parent's callback to refresh data
        if (onSweetUpdated) {
          onSweetUpdated();
        }
        
        // Close the modal
        onClose();
      }
      
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
        
        // Extract and display validation errors
        if (errorData) {
          let errorMessage = 'Failed to update sweet. ';
          
          if (typeof errorData === 'object') {
            const errorMessages = [];
            
            // Check for field-specific errors
            if (errorData.name) {
              errorMessages.push(`Name: ${Array.isArray(errorData.name) ? errorData.name.join(', ') : errorData.name}`);
            }
            if (errorData.category) {
              errorMessages.push(`Category: ${Array.isArray(errorData.category) ? errorData.category.join(', ') : errorData.category}`);
            }
            if (errorData.price) {
              errorMessages.push(`Price: ${Array.isArray(errorData.price) ? errorData.price.join(', ') : errorData.price}`);
            }
            if (errorData.quantity) {
              errorMessages.push(`Quantity: ${Array.isArray(errorData.quantity) ? errorData.quantity.join(', ') : errorData.quantity}`);
            }
            
            if (errorMessages.length > 0) {
              errorMessage += errorMessages.join('. ');
            } else if (errorData.detail) {
              errorMessage += errorData.detail;
            } else {
              errorMessage += JSON.stringify(errorData);
            }
          } else {
            errorMessage += errorData.toString();
          }
          
          setError(errorMessage);
        } else {
          setError('Failed to update sweet. Please try again.');
        }
      } else if (err.request) {
        // Request was made but no response received (network error)
        setError('Network error. Please check your connection and try again.');
      } else {
        // Something else happened
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 107, 157, 0.3)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(255, 107, 157, 0.3)',
        background: 'linear-gradient(145deg, #ffffff 0%, #fff9fc 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>✏️</div>
            <h2 style={{ 
              margin: 0, 
              color: '#ff6b9d',
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Edit Sweet</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #fc8181 0%, #f56565 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '8px 14px',
              fontWeight: '700',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(252, 129, 129, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'rotate(90deg) scale(1.1)';
              e.target.style.boxShadow = '0 4px 12px rgba(252, 129, 129, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'rotate(0deg) scale(1)';
              e.target.style.boxShadow = '0 2px 8px rgba(252, 129, 129, 0.3)';
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '20px', marginBottom: '25px' }}>
            <div>
              <label htmlFor="edit-name" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Name:</label>
              <input
                type="text"
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '16px 20px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '16px',
                  fontSize: '16px',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b9d';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 107, 157, 0.1), 0 4px 12px rgba(255, 107, 157, 0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f7fafc';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
            
            <div>
              <label htmlFor="edit-category" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Category:</label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{ 
                  width: '100%', 
                  padding: '16px 20px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '16px',
                  fontSize: '16px',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b9d';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 107, 157, 0.1), 0 4px 12px rgba(255, 107, 157, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f7fafc';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <option value="">Select category...</option>
                <option value="CHOCOLATE">Chocolate</option>
                <option value="GUMMY">Gummy</option>
                <option value="HARD_CANDY">Hard Candy</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="edit-price" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Price:</label>
              <input
                type="number"
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                required
                style={{ 
                  width: '100%', 
                  padding: '16px 20px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '16px',
                  fontSize: '16px',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b9d';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 107, 157, 0.1), 0 4px 12px rgba(255, 107, 157, 0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f7fafc';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
            
            <div>
              <label htmlFor="edit-quantity" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Quantity:</label>
              <input
                type="number"
                id="edit-quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                required
                style={{ 
                  width: '100%', 
                  padding: '16px 20px', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '16px',
                  fontSize: '16px',
                  backgroundColor: '#f7fafc',
                  color: '#2d3748',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ff6b9d';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 4px rgba(255, 107, 157, 0.1), 0 4px 12px rgba(255, 107, 157, 0.15)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.backgroundColor = '#f7fafc';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
            </div>
          </div>
          
          {error && (
            <div style={{ 
              backgroundColor: '#fed7d7', 
              color: '#c53030', 
              margin: '15px 0', 
              padding: '14px 18px', 
              borderRadius: '12px',
              border: '2px solid #fc8181',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                padding: '14px 28px', 
                backgroundColor: '#ffffff', 
                color: '#718096', 
                border: '2px solid #e2e8f0',
                borderRadius: '16px', 
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#cbd5e0';
                e.target.style.backgroundColor = '#f7fafc';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.backgroundColor = '#ffffff';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                padding: '14px 28px', 
                background: isLoading ? '#cbd5e0' : 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '16px', 
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                boxShadow: isLoading ? 'none' : '0 6px 20px rgba(255, 107, 157, 0.4)'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 157, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 6px 20px rgba(255, 107, 157, 0.4)';
                }
              }}
            >
              {isLoading ? '⏳ Updating...' : '✨ Update Sweet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSweetModal;

