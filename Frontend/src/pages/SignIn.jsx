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
  Fade,
  Slide,
} from "@mui/material";
import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
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
      await axios.post(
        "http://localhost:3000/auth/register",
        formData,
        { withCredentials: true }
      );
      toast.success("User registered successfully! 🎉");

      const elapsed = Date.now() - start;
      setTimeout(() => {
        setLoading(false);
        navigate("/login");
      }, Math.max(0, 1000 - elapsed));
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || "Failed to register.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-background">
      <CssBaseline />
      <Fade in={true} timeout={1000}>
        <Box className="auth-page-container">
          <Slide direction="up" in={true} timeout={800}>
            <Box className="auth-form-container">
              {loading && (
                <div className="loader-container6">
                  <img
                    src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
                    alt="Loading..."
                    className="custom-loader6"
                  />
                </div>
              )}
              <Typography variant="h4" className="auth-title">
                Sign Up
              </Typography>
              {error && (
                <Typography className="auth-error-message">{error}</Typography>
              )}
              <form onSubmit={handleSubmit} className="auth-form">
                <TextField
                  label="Username"
                  name="username"
                  variant="outlined"
                  fullWidth
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="auth-text-field"
                  disabled={loading}
                />
                <TextField
                  label="Email"
                  name="email"
                  variant="outlined"
                  fullWidth
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="auth-text-field"
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
                  className="auth-text-field"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  className="auth-submit-button"
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
              <Typography className="auth-footer-text">
                Already have an account?{" "}
                <a href="/login" className="auth-link">
                  Log in
                </a>
              </Typography>
            </Box>
          </Slide>
          <div className="auth-image-section">
            <div className="auth-image-overlay">
              <h2>Organize, Succeed</h2>
              <p>Plan Your Tasks, Achieve Your Goals</p>
            </div>
          </div>
        </Box>
      </Fade>
      <div className="toast-container">
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default SignIn;