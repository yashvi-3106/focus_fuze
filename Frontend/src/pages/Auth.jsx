import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
      const response = await axios.post("http://localhost:3000/auth/login", formData);

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
      const errorMsg = err.response?.data?.error || "Invalid credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <div className="auth-background">
      {/* Left: Login Form */}
      <div className="auth-container1">
        {loading && (
          <div className="loader-container5">
            <img
              src="https://cdn-icons-png.freepik.com/256/11857/11857533.png?semt=ais_hybrid"
              alt="Loading..."
              className="custom-loader5"
            />
          </div>
        )}

        <h2 className="log-in">Log In</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit} className="log-form">
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <button className="auth-button" type="submit">Log In</button>
        </form>
        <p className="auth-dont">Don’t have an account? <a href="/register">Sign Up</a></p>
      </div>

      {/* Right: Image */}
      <div className="auth-image">
        <img src="https://img.freepik.com/free-vector/privacy-policy-concept-illustration_114360-7853.jpg" alt="Privacy Policy" />
      </div>
    </div>
  );
};

export default Auth;
