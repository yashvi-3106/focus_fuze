import "./navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const Navbar = () => {
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for hamburger menu
  const userId = localStorage.getItem("userId");
  const API_URL = "http://localhost:3000/api/profile";
  const BASE_URL = "http://localhost:3000";
  const defaultProfileIcon = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    if (userId) {
      fetchProfilePhoto();
    }
  }, [userId]);

  const fetchProfilePhoto = async () => {
    try {
      const response = await axios.get(`${API_URL}/${userId}`);
      const data = response.data || {};
      setProfilePhoto(data.profilePhoto ? `${BASE_URL}${data.profilePhoto}` : null);
    } catch (error) {
      console.error("Error fetching profile photo:", error);
      setProfilePhoto(null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("https://focus-fuze.onrender.com/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Logout failed");
      console.log("Logged out successfully");
      localStorage.removeItem("userId");
      setProfilePhoto(null);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo">
        <Link to="/home">
          <img className="logo" src="" alt="Logo" /> {/* Replace with your logo */}
        </Link>
      </div>

      {/* Hamburger Menu Button */}
      <button className="hamburger" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {/* Navigation Links */}
      <div className={`item ${isMenuOpen ? "open" : ""}`}>
        <Link to="/personal-goals" className="link" onClick={toggleMenu}>Personal Goals</Link>
        <Link to="/team-goals" className="link" onClick={toggleMenu}>Team Goal</Link>
        <Link to="/notes" className="link" onClick={toggleMenu}>Notes</Link>
        <Link to="/calendar" className="link" onClick={toggleMenu}>Calendar</Link>
        <Link to="/save-video" className="link" onClick={toggleMenu}>NoteTube</Link>
        <Link to="/dashboard" className="link" onClick={toggleMenu}>Dashboard</Link>
        
      </div>

      {/* Profile Icon/Photo */}
      <div className="profile-icon">
        <Link to="/profile">
          <img
            src={profilePhoto || defaultProfileIcon}
            alt="Profile"
            className="navbar-profile-photo"
            onError={(e) => {
              e.target.src = defaultProfileIcon;
            }}
          />
        </Link>
      </div>

     
    </nav>
  );
};

export default Navbar;