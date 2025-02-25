import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import toast styles
import "./Login.css";

const Auth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      const response = await axios.post("http://localhost:3000/auth/login", formData);

      // Store userId and username in localStorage
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("username", response.data.username);

      toast.success("Login successful! 🎉"); // ✅ Show success toast instead of alert

      const elapsed = Date.now() - start;
      setTimeout(() => {
        setLoading(false);
        navigate("/home"); // Redirect after 1 sec minimum
      }, Math.max(0, 1000 - elapsed));
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.error || "Invalid credentials.";
      setError(errorMsg);
      toast.error(errorMsg); // ❌ Show error toast
    }
  };

  return (
    <div className="auth-container">
      {loading && ( // Show loader while loading
        <div className="loader-container5">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
            alt="Loading..."
            className="custom-loader5"
          />
        </div>
      )}

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
      <p>Don’t have an account? <a href="/register">Sign Up</a></p>
    </div>
  );
};

export default Auth;
