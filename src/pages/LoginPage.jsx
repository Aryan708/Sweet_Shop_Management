import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { loginUser } = useAuth();
  
  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear any previous errors
    setIsLoading(true);

    try {
      // Call loginUser from context - it handles API call, token saving, and navigation
      await loginUser(username, password);
    } catch (err) {
      // Handle login errors
      setIsLoading(false);
      
      if (err.response) {
        // Server responded with error status
        const errorData = err.response.data;
        
        // Extract error message from DRF response
        if (errorData) {
          let errorMessage = '';
          
          if (typeof errorData === 'object') {
            // Check for common DRF error fields
            if (errorData.detail) {
              // Use detail field if available (e.g., "No active account found")
              errorMessage = errorData.detail;
            } else if (errorData.non_field_errors) {
              // Use non_field_errors if available
              errorMessage = Array.isArray(errorData.non_field_errors) 
                ? errorData.non_field_errors.join(', ') 
                : errorData.non_field_errors;
            } else if (errorData.username) {
              errorMessage = `Username: ${Array.isArray(errorData.username) ? errorData.username.join(', ') : errorData.username}`;
            } else if (errorData.password) {
              errorMessage = `Password: ${Array.isArray(errorData.password) ? errorData.password.join(', ') : errorData.password}`;
            } else {
              // Fallback to stringified error
              errorMessage = JSON.stringify(errorData);
            }
          } else {
            errorMessage = errorData.toString();
          }
          
          setError(errorMessage);
        } else {
          setError('Login failed. Please try again.');
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
      <h1>Login Page</h1>
      
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
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        {error && (
          <div style={{ color: 'red', margin: '10px 0' }}>
            {error}
          </div>
        )}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <Link to="/register">Don't have an account? Register here</Link>
      </div>
    </div>
  );
};

export default LoginPage;

