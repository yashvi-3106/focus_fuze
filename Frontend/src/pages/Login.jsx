import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LogIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/auth/login", formData);

      // Store userId and username in localStorage
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("username", response.data.username);
      

      alert("Login successful!");
      navigate("/home"); // Redirect to home after login
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Log In</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
        />
        <button type="submit">Log In</button>
      </form>
      <p>Don not have an account? <a href="/register">Sign Up</a></p>
    </div>
  );
};

export default LogIn;

