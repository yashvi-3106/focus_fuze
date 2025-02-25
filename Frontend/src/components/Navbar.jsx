import "./navbar.css";
import { Link , useNavigate} from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();
  
  // ✅ React Router navigation hook
  const handleLogout = async () => {
    try {
      const response = await fetch("https://focus-fuze.onrender.com/auth/logout", {
        method: "POST",
        // credentials: "include", // ✅ Required for session-based authentication
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Logout failed");
      console.log("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="navbar">
      {/* ✅ Logo on the Left Corner */}
      <div className="logo">
        <Link to="/home">
          {/* <img src="https://i.pinimg.com/736x/26/7e/db/267edb684b6c6d481346f4fb84dd2837.jpg" alt="Logo" /> */}
        </Link>
      </div>

      <div className="item">
        <Link to="/home" className="link">Home</Link>
        <Link to="/personal-goals" className="link">PersonalGoals</Link>
        <Link to="/calendar-page" className="link">Calendar</Link>
        <Link to="/notes" className="link">Notes</Link>
        <Link to="/save-video" className="link">Cart</Link>
        <Link to="/contact" className="link">Contact</Link>
      </div>

      {/* ✅ Logout Button in the Right Corner */}
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default Navbar;
