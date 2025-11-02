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
              errorMessage += errorData.detail;
            } else {
              errorMessage += JSON.stringify(errorData);
            }
          } else {
            errorMessage += errorData.toString();
          }
          
          setError(errorMessage);
        } else {
          setError('Failed to create sweet. Please try again.');
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
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
      <h2 style={{ marginTop: '0' }}>Add New Sweet to Inventory</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label htmlFor="sweet-name" style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input
              type="text"
              id="sweet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sweet name..."
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
            />
          </div>
          
          <div>
            <label htmlFor="sweet-category" style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
            <select
              id="sweet-category"
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
            <label htmlFor="sweet-price" style={{ display: 'block', marginBottom: '5px' }}>Price:</label>
            <input
              type="number"
              id="sweet-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (e.g., 5.99)"
              step="0.01"
              min="0"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
            />
          </div>
          
          <div>
            <label htmlFor="sweet-quantity" style={{ display: 'block', marginBottom: '5px' }}>Quantity:</label>
            <input
              type="number"
              id="sweet-quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity..."
              min="0"
              required
              style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '3px' }}
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
            padding: '10px 20px', 
            backgroundColor: isLoading ? '#6c757d' : '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '3px', 
            cursor: isLoading ? 'not-allowed' : 'pointer' 
          }}
        >
          {isLoading ? 'Creating...' : 'Create Sweet'}
        </button>
      </form>
    </div>
  );
};

export default CreateSweetForm;

