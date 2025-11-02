import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN_KEY } from '../utils/constants';

// Create AuthContext
export const AuthContext = createContext();

// Custom hook to use AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider Component - must be used inside BrowserRouter
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const navigate = useNavigate();

  // Check Local Storage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedToken) {
      setAuthToken(storedToken);
      // Optionally decode token or fetch user data here
      // For now, we just set the token
    }
  }, []);

  // Login function
  const loginUser = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login/`, {
        username,
        password,
      });

      const { access } = response.data;

      // Save token to Local Storage and state
      localStorage.setItem(AUTH_TOKEN_KEY, access);
      setAuthToken(access);
      
      // Set user data if available (you can decode JWT or fetch user info here)
      setUser({ username });

      // Navigate to dashboard
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Re-throw to let component handle it
    }
  };

  // Logout function
  const logoutUser = () => {
    // Remove token from Local Storage and state
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setAuthToken(null);
    setUser(null);

    // Navigate to login page
    navigate('/login');
  };

  const value = {
    user,
    authToken,
    loginUser,
    logoutUser,
    isAuthenticated: !!authToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

