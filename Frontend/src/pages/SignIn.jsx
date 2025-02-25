import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loader state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true); // Start loading
    const start = Date.now();

    try {
      await axios.post("http://localhost:3000/auth/register", formData);
      toast.success("User registered successfully! 🎉"); // Success toast

      const elapsed = Date.now() - start;
      setTimeout(() => {
        setLoading(false);
        navigate("/login"); // Redirect after 1 sec minimum
      }, Math.max(0, 1000 - elapsed));
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.error || "Failed to register.";
      setError(errorMessage);
      toast.error(errorMessage); // Error toast
    }
  };

  return (
    <div className="auth-container">
      {loading && (
        <div className="loader-container6">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
            alt="Loading..."
            className="custom-loader6"
          />
        </div>
      )}

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
