import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/constants';

const CreateSweetForm = ({ onSweetCreated }) => {
  const { authToken, logoutUser } = useAuth();
  
  // Form state management
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/sweets/`,
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

      // Success handling - status 201
      if (response.status === 201) {
        // Reset form fields
        setName('');
        setCategory('');
        setPrice('');
        setQuantity('');
        
        // Show success message
        setSuccessMessage('Sweet created successfully!');
        
        // Call the parent's callback to refresh data
        if (onSweetCreated) {
          onSweetCreated();
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
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
          let errorMessage = 'Failed to create sweet. ';
          
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
              // Check for permission-related errors
              if (typeof errorData.detail === 'string' && errorData.detail.includes('permission') || errorData.detail.includes('admin')) {
                errorMessage = 'Permission denied: Only Admin users can add items to stock. Please contact an administrator or use the Admin Portal.';
              } else {
                errorMessage += errorData.detail;
              }
            } else {
              errorMessage += JSON.stringify(errorData);
            }
          } else {
            errorMessage += errorData.toString();
          }
          
          setError(errorMessage);
        } else {
          // Check if it's a permission error
          if (err.response.status === 403) {
            errorMessage = 'Permission denied: Only Admin users can add items to stock. Please use the Admin Portal to add items.';
          } else {
            errorMessage += 'Please try again.';
          }
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

  return (
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
        ➕ Add New Sweet
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label htmlFor="sweet-name" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Name:</label>
            <input
              type="text"
              id="sweet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sweet name..."
              required
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
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
            <label htmlFor="sweet-category" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Category:</label>
            <select
              id="sweet-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
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
            >
              <option value="">Select category...</option>
              <option value="CHOCOLATE">Chocolate</option>
              <option value="GUMMY">Gummy</option>
              <option value="HARD_CANDY">Hard Candy</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="sweet-price" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Price:</label>
            <input
              type="number"
              id="sweet-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (e.g., 5.99)"
              step="0.01"
              min="0"
              required
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
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
            <label htmlFor="sweet-quantity" style={{ display: 'block', marginBottom: '10px', color: '#4a5568', fontWeight: '600', fontSize: '15px' }}>Quantity:</label>
            <input
              type="number"
              id="sweet-quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity..."
              min="0"
              required
              style={{ 
                width: '100%', 
                padding: '14px 18px', 
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
        
        {successMessage && (
          <div style={{ color: 'green', margin: '10px 0', padding: '10px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '3px' }}>
            {successMessage}
          </div>
        )}
        
        {error && (
          <div style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '3px' }}>
            {error}
          </div>
        )}
        
        <button 
          type="submit" 
          disabled={isLoading}
          style={{ 
            padding: '14px 28px', 
            background: isLoading ? '#cbd5e0' : 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)', 
            color: '#ffffff', 
            border: 'none',
            borderRadius: '16px', 
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontWeight: '700',
            fontSize: '16px',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            boxShadow: isLoading ? 'none' : '0 6px 20px rgba(72, 187, 120, 0.4)'
          }}
          onMouseOver={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(72, 187, 120, 0.5)';
            }
          }}
          onMouseOut={(e) => {
            if (!isLoading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(72, 187, 120, 0.4)';
            }
          }}
        >
          {isLoading ? '⏳ Creating...' : '✨ Add Sweet'}
        </button>
      </form>
    </div>
  );
};

export default CreateSweetForm;

