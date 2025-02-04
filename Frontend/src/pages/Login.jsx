// LogIn.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const LogIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send the login request to the backend
      const response = await axios.post('https://focus-fuze.onrender.com/auth/login', {
        username,
        password,
      });

      // Store the JWT token in localStorage
      localStorage.setItem('token', response.data.token);

      // Redirect to the home page after successful login
      navigate('/home');
    } catch (err) {
      // Handle errors, e.g., invalid credentials
      setError(err.response?.data || 'Invalid credentials');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Log In</h2>
        
        {/* Display error message if login fails */}
        {error && <p className="error-message">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="input-field"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="submit-button">
          Log In
        </button>

        <p className="signup-text">
          Don’t have an account?{' '}
          <Link to="/signin" className="signup-link">
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LogIn;
