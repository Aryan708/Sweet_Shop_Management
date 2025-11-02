import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        top: '8%',
        left: '8%',
        fontSize: '40px',
        animation: 'float 6s ease-in-out infinite',
        opacity: 0.2
      }}>🍪</div>
      <div style={{
        position: 'absolute',
        top: '25%',
        right: '8%',
        fontSize: '35px',
        animation: 'float 7s ease-in-out infinite',
        animationDelay: '1s',
        opacity: 0.2
      }}>🧁</div>
      <div style={{
        position: 'absolute',
        bottom: '12%',
        left: '12%',
        fontSize: '45px',
        animation: 'float 8s ease-in-out infinite',
        animationDelay: '2s',
        opacity: 0.2
      }}>🍩</div>
      <div style={{
        position: 'absolute',
        bottom: '25%',
        right: '12%',
        fontSize: '38px',
        animation: 'float 6.5s ease-in-out infinite',
        animationDelay: '0.5s',
        opacity: 0.2
      }}>🍭</div>
      
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
        maxWidth: '540px',
        position: 'relative',
        zIndex: 1,
        background: 'linear-gradient(145deg, #ffffff 0%, #fff9fc 100%)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '60px', marginBottom: '15px' }}>🍰</div>
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
          <p style={{ color: '#718096', fontSize: '16px', fontWeight: '500' }}>Join Our Sweet Family! 🎊</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '18px' }}>
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
          
          <div style={{ marginBottom: '18px' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#4a5568',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          
          <div style={{ marginBottom: '18px' }}>
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
          
          <div style={{ marginBottom: '24px' }}>
            <label 
              htmlFor="password2" 
              style={{ 
                display: 'block', 
                marginBottom: '10px', 
                color: '#4a5568',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="password2"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
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
            style={{
              width: '100%',
              padding: '18px',
              background: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '16px',
              fontSize: '17px',
              fontWeight: '700',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(255, 107, 157, 0.4)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 32px rgba(255, 107, 157, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 24px rgba(255, 107, 157, 0.4)';
            }}
          >
            🎉 Create Account
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ color: '#718096', fontSize: '15px', fontWeight: '500' }}>
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#ff6b9d', 
                textDecoration: 'none',
                fontWeight: '700',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Sign in here ✨
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

