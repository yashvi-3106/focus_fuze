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
        { withCredentials: true } // Include session cookies
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
      <Box className="auth-container">
        {loading && (
          <div className="loader-container6">
            <img
              src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
              alt="Loading..."
              className="custom-loader6"
            />
          </div>
        )}
        <Typography variant="h2" className="sign-in">
          Sign Up
        </Typography>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="auth-form">
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            required
            sx={{ marginBottom: 2 }}
            InputLabelProps={{ style: { color: "#555" } }}
            InputProps={{ style: { borderRadius: "5px" } }}
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
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>
        <p className="sign-dont">
          Already have an account? <a href="/login" className="auth-link">Log in</a>
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

export default SignIn;