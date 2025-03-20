import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import PersonalGoal from "./pages/PersonalGoal";


import Navbar from "./components/Navbar";
import CalendarPage from "./pages/CalendarPage";
import Note from "./pages/Note";
import BlogPage from "./pages/BlogPage";
import Auth from "./pages/Auth";
import SaveVideo from "./pages/SaveVideo";
// import Contact from "./pages/Contact";
import VideoNote from "./pages/VideoNote";
import TeamGoalPage from "./pages/TeamGoalPage";
import Dashboard from "./pages/Dashboard";

// In index.js or App.jsx
import axios from "axios";
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} /> {/* Global Toast Container */}
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
        <Route path="/" element={<SignIn />} />               
        <Route path="/login" element={<Auth />} />            
        <Route path="/register" element={<SignIn />} />     
        <Route path="/home" element={<Home />} />
        <Route path="/personal-goals" element={<PersonalGoal />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/notes" element={<Note />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/save-video" element={<SaveVideo />} />
        {/* <Route path="/contact" element={<Contact />} /> */}
        <Route path="/video/:videoId" element={<VideoNote />} />
        <Route path="/team-goals" element={<TeamGoalPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

export default App;
