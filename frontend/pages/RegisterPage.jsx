import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const RegisterPage = () => {
  const navigate = useNavigate();
  
  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register/`, {
        username,
        email,
        password,
        password2,
      });

      // Success handling - status 201
      if (response.status === 201) {
        // Navigate to login page
        navigate('/login');
      }
    } catch (err) {
      // Error handling
      if (err.response) {
        // Server responded with error status
        const errorData = err.response.data;
        
        // Handle DRF validation errors
        if (errorData) {
          // Try to extract error messages from DRF serializer
          let errorMessage = 'Registration failed. ';
          
          if (typeof errorData === 'object') {
            // Extract error messages from DRF error format
            const errorMessages = [];
            
            // Check for common error fields
            if (errorData.username) {
              errorMessages.push(`Username: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`);
            }
            if (errorData.email) {
              errorMessages.push(`Email: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`);
            }
            if (errorData.password) {
              errorMessages.push(`Password: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`);
            }
            if (errorData.password2) {
              errorMessages.push(`Password Confirmation: ${Array.isArray(errorData.password2) ? errorData.password2.join(', ') : errorData.password2}`);
            }
            
            // If we have specific field errors, use them
            if (errorMessages.length > 0) {
              errorMessage += errorMessages.join('. ');
            } else if (errorData.detail) {
              // Use detail field if available
              errorMessage += errorData.detail;
            } else {
              // Fallback to stringified error
              errorMessage += JSON.stringify(errorData);
            }
          } else {
            errorMessage += errorData.toString();
          }
          
          setError(errorMessage);
        } else {
          setError('Registration failed. Please try again.');
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
    <div>
      <h1>Register Page</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password2">Confirm Password:</label>
          <input
            type="password"
            id="password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}
        
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;

