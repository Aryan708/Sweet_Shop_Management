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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Edit Sweet</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px'
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label htmlFor="edit-name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
              <input
                type="text"
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
            
            <div>
              <label htmlFor="edit-category" style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
              >
                <option value="">Select category...</option>
                <option value="CHOCOLATE">Chocolate</option>
                <option value="GUMMY">Gummy</option>
                <option value="HARD_CANDY">Hard Candy</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="edit-price" style={{ display: 'block', marginBottom: '5px' }}>Price:</label>
              <input
                type="number"
                id="edit-price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
            
            <div>
              <label htmlFor="edit-quantity" style={{ display: 'block', marginBottom: '5px' }}>Quantity:</label>
              <input
                type="number"
                id="edit-quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0"
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
              />
            </div>
          </div>
          
          {error && (
            <div style={{ color: 'red', margin: '10px 0', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '3px' }}>
              {error}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px', 
                cursor: 'pointer' 
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: isLoading ? '#6c757d' : '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px', 
                cursor: isLoading ? 'not-allowed' : 'pointer' 
              }}
            >
              {isLoading ? 'Updating...' : 'Update Sweet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateSweetModal;

