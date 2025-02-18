import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import SignIn from "./pages/SignIn";
import LogIn from "./pages/LogIn";
import Home from "./pages/Home";
import PersonalGoal from "./pages/PersonalGoal";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import Note from "./pages/Note"
import BlogPage from "./pages/BlogPage";


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
        {/* <Route path="/" element={<SignIn />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<SignIn />} /> */}
        <Route path="/" element={<SignIn />} />               {/* SignUp page */}
        <Route path="/login" element={<LogIn />} />            {/* Login page */}
        <Route path="/register" element={<SignIn />} />     
        <Route path="/home" element={<Home />} />
        <Route path="/personal-goals" element={<PersonalGoal />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar-page" element={<CalendarPage />} />
        <Route path="/notes" element={<Note/>} />
        <Route path="/blog" element={<BlogPage />} />
        
      </Routes>
    </div>
  );
};

export default App;
