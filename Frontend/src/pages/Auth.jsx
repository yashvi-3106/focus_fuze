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
        "http://localhost:3000/auth/login",
        formData,
        { withCredentials: true }
      );
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("username", response.data.username);
      toast.success("Login successful! 🎉");
      const elapsed = Date.now() - start;
      setTimeout(() => {
        setLoading(false);
        navigate("/home"); // This should now work
      }, Math.max(0, 1000 - elapsed));
    } catch (err) {
      // ... error handling
    }
  };

  return (
    <div className="auth-background">
      <CssBaseline />
      <Box className="auth-container1">
        {loading && (
          <div className="loader-container5">
            <img
              src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
              alt="Loading..."
              className="custom-loader5"
            />
          </div>
        )}
        <Typography variant="h2" className="log-in">
          Log In
        </Typography>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="log-form">
          <TextField
            label="Email"
            name="email"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ marginBottom: 2 }}
            InputLabelProps={{ style: { color: "#555" } }}
            InputProps={{ style: { borderRadius: "5px" } }}
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
            sx={{ marginBottom: 2 }}
            InputLabelProps={{ style: { color: "#555" } }}
            InputProps={{ style: { borderRadius: "5px" } }}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              backgroundColor: "#007bff",
              "&:hover": {
                backgroundColor: "#0056b3",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 15px rgba(0, 123, 255, 0.3)",
              },
              borderRadius: "5px",
              padding: "12px 25px",
              fontSize: "16px",
              transition: "all 0.3s ease",
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>
        <p className="auth-dont">
          Don’t have an account? <a href="/register">Sign Up</a>
        </p>
      </Box>
      <div className="auth-image">
        <img
          src="https://img.freepik.com/free-vector/privacy-policy-concept-illustration_114360-7853.jpg"
          alt="Privacy Policy"
        />
      </div>
      <div className="toast-container">
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default Auth;