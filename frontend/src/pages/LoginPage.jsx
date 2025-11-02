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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated candy decorations */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        fontSize: '40px',
        animation: 'float 6s ease-in-out infinite',
        opacity: 0.2
      }}>🍭</div>
      <div style={{
        position: 'absolute',
        top: '20%',
        right: '10%',
        fontSize: '35px',
        animation: 'float 7s ease-in-out infinite',
        animationDelay: '1s',
        opacity: 0.2
      }}>🍬</div>
      <div style={{
        position: 'absolute',
        bottom: '15%',
        left: '15%',
        fontSize: '45px',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '2s',
        opacity: 0.2
      }}>🍰</div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        fontSize: '38px',
        animation: 'float 6.5s ease-in-out infinite',
        animationDelay: '0.5s',
        opacity: 0.2
      }}>🍫</div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
      `}</style>
      
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(255, 107, 157, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.8)',
        padding: '50px 45px',
        width: '100%',
        maxWidth: '480px',
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(145deg, #ffffff 0%, #fff9fc 100%)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>🍬</div>
          <h1 style={{ 
            color: '#ff6b9d', 
            marginBottom: '8px',
            fontSize: '42px',
            fontWeight: '700',
            letterSpacing: '-1px',
            background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #ff8fab 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Sweet Shop
          </h1>
          <p style={{ color: '#718096', fontSize: '16px', fontWeight: '500' }}>Welcome Back! 🎉</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label 
              htmlFor="username" 
              style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#4a5568',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
          
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#4a5568',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          
          {error && (
            <div style={{ 
              backgroundColor: '#fed7d7',
              color: '#c53030',
              padding: '14px 18px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              border: '2px solid #fc8181',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '18px',
              background: isLoading ? '#cbd5e0' : 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '17px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '24px',
              boxShadow: isLoading ? 'none' : '0 8px 24px rgba(255, 107, 157, 0.4)'
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 157, 0.5)';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 157, 0.4)';
              }
            }}
          >
            {isLoading ? '⏳ Logging in...' : '🍭 Sign In'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ color: '#718096', fontSize: '15px', fontWeight: '500', marginBottom: '20px' }}>
            New customer?{' '}
            <Link 
              to="/register" 
              style={{ 
                color: '#ff6b9d', 
                textDecoration: 'none',
                fontWeight: '700',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Create an account ✨
            </Link>
          </p>
          
          {/* Admin Portal Button */}
          <div style={{ 
            padding: '16px',
            backgroundColor: '#f0f4ff',
            borderRadius: '12px',
            border: '2px solid #c7d2fe',
            marginTop: '20px'
          }}>
            <p style={{ 
              color: '#4c51bf', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px' 
            }}>
              👨‍💼 Are you an Admin?
            </p>
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                backgroundColor: '#4c51bf',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(76, 81, 191, 0.3)',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#4338ca';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(76, 81, 191, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#4c51bf';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(76, 81, 191, 0.3)';
              }}
            >
              🔐 Admin Portal Login
            </a>
            <p style={{ 
              color: '#667eea', 
              fontSize: '13px', 
              marginTop: '10px',
              fontStyle: 'italic'
            }}>
              Admins can also login normally above to access the customer dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

