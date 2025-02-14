import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import SignIn from "./pages/SignIn";
import LogIn from "./pages/LogIn";
import Home from "./pages/Home";
import PersonalGoal from "./pages/PersonalGoal";
// import TeamGoal from "./pages/TeamGoal";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
// import TaskDashboard from "./pages/TaskDashboard";
import CalendarPage from "./pages/CalendarPage";
import Note from "./pages/Note"

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
        <Route path="/" element={<SignIn />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/personal-goals" element={<PersonalGoal />} />
        {/* <Route path="/team-goals" element={<TeamGoal />} /> */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/task-dashboard/:taskId" element={<TaskDashboard />} /> */}
        <Route path="/calendar-page" element={<CalendarPage />} />
        <Route path="/notes" element={<Note/>} />
      </Routes>
    </div>
  );
};

export default App;
