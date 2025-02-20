import "./navbar.css"
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar" >
      <div className="item">
        
          <Link to="/home" className="link">
            Home
          </Link>
          <Link to="/personal-goals" className="link">
            Personal Goals
          </Link>

          <Link to="/calendar-page" className="link">
          Calendar
          </Link>
          <Link to="/notes" className="link">
            Notes
          </Link>

      </div>
    </nav>
  );
};

export default Navbar;
