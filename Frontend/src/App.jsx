import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import PersonalGoal from "./pages/PersonalGoal";
import Navbar from "./components/Navbar";

import CalendarPage from "./pages/CalendarPage";
import Note from "./pages/Note"
import BlogPage from "./pages/BlogPage";
import Auth from "./pages/Auth";



const App = () => {
  return (
    <Router>
      <MainContent />
    </Router>
  );
};

const MainContent = () => {
  const location = useLocation();
  const hideNavbar = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <div>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<SignIn />} />               {/* SignUp page */}
        <Route path="/login" element={<Auth />} />            {/* Login page */}
        <Route path="/register" element={<SignIn />} />     
        <Route path="/home" element={<Home />} />
        <Route path="/personal-goals" element={<PersonalGoal />} />
      
        <Route path="/calendar-page" element={<CalendarPage />} />
        <Route path="/notes" element={<Note/>} />
        <Route path="/blog" element={<BlogPage />} />
        
      </Routes>
    </div>
  );
};

export default App;
