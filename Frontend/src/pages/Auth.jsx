import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  TextField,
  Button,
  CssBaseline,
  Typography,
  Box,
} from "@mui/material";
import "./Login.css";

const Auth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const start = Date.now();
  
    try {
      const response = await axios.post(
        "https://focus-fuze.onrender.com/auth/login",
        formData,
        { withCredentials: true }
      );
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("username", response.data.username);
      toast.success("Login successful! 🎉");
      const elapsed = Date.now() - start;
      setTimeout(() => {
        setLoading(false);
        navigate("/home");
      }, Math.max(0, 1000 - elapsed));
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || "Failed to login.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-login-background">
      <CssBaseline />
      <Box className="auth-login-wrapper">
        <Box className="auth-login-form-box">
          {loading && (
            <div className="auth-login-loader-container">
              <img
                src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
                alt="Loading..."
                className="auth-login-loader"
              />
            </div>
          )}
          <Typography variant="h4" className="auth-login-heading">
            Log In
          </Typography>
          {error && <p className="auth-login-error">{error}</p>}
          <form onSubmit={handleSubmit} className="auth-login-form">
            <TextField
              label="Email"
              name="email"
              variant="outlined"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-login-input"
              disabled={loading}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-login-input"
              disabled={loading}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              className="auth-login-submit-btn"
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
          <p className="auth-login-footer-text">
            Don’t have an account? <a href="/register" className="auth-login-link">Sign Up</a>
          </p>
        </Box>
        <div className="auth-login-image-section">
          <div className="auth-login-image-overlay">
            <h2>Secure Your Tasks</h2>
            <p>Stay Organized with Confidence</p>
          </div>
        </div>
      </Box>
      <div className="auth-login-toast-container">
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default Auth;