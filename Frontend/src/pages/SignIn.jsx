import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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
      // eslint-disable-next-line no-unused-vars
      const response = await axios.post("http://localhost:3000/auth/register", formData);
      alert("User registered successfully!");
      navigate("/login"); // Redirect to login page after registration
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register.");
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
          className="auth-input"
          style={{padding:"12px", border:"2px solid black", borderRadius:"6px", width:"93%"}}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="auth-input"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="auth-input"
        />
        <button type="submit" className="auth-button">Register</button>
      </form>
      <p className="auth-footer">
        Already have an account? <a href="/login" className="auth-link">Log in</a>
      </p>
    </div>
  );
};

export default SignIn;
