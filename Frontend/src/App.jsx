import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import "react-toastify/dist/ReactToastify.css"; // Import toast styles

import Login from "./pages/Login";
import SignUp from "./pages/SignIn";
import Home from "./pages/Home";
import PersonalGoal from "./pages/PersonalGoal";
import Navbar from "./components/Navbar";
import CalendarPage from "./pages/CalendarPage";
import Note from "./pages/Note";
// import BlogPage from "./pages/BlogPage";
import SaveVideo from "./pages/SaveVideo";
import VideoNote from "./pages/VideoNote";
import TeamGoalPage from "./pages/TeamGoalPage";

import Profile from "./pages/Profile";
import ErrorBoundary from "./pages/ErrorBoundary";

import Dashboard from "./pages/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute";




// In index.js or App.jsx
import axios from "axios";
axios.defaults.withCredentials = true;

const App = () => {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> {/* Global Toast Container */}
      <ErrorBoundary>
        <MainContent />
      </ErrorBoundary>
    </Router>
  );
};

const MainContent = () => {
  const location = useLocation();
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideNavbar && <Navbar />}

      {/* Page content */}
      <main className={!hideNavbar ? "pt-16" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />

          {/* Protected Routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-goals"
            element={
              <ProtectedRoute>
                <PersonalGoal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes"
            element={
              <ProtectedRoute>
                <Note />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/blog"
            element={
              <ProtectedRoute>
                <BlogPage />
              </ProtectedRoute>
            }
          /> */}
          <Route
            path="/save-video"
            element={
              <ProtectedRoute>
                <SaveVideo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video/:videoId"
            element={
              <ProtectedRoute>
                <VideoNote />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-goals"
            element={
              <ProtectedRoute>
                <TeamGoalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};



export default App;