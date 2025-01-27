import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Login from './pages/Login';
import Home from './pages/Home';
import PersonalGoals from './pages/PersonalGoals';
import TeamGoals from './pages/TeamGoals';
import Calendar from './pages/CalendarPage';
import UserDashboard from './pages/UserDashboard';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check if the user is logged in

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={!isAuthenticated ? <SignIn /> : <Navigate to="/home" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/home" />} />
        <Route path="/home" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
        <Route path="/personal-goals" element={isAuthenticated ? <PersonalGoals /> : <Navigate to="/login" />} />
        <Route path="/team-goals" element={isAuthenticated ? <TeamGoals /> : <Navigate to="/login" />} />
        <Route path="/calendar" element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />} />
        <Route path="/user-dashboard" element={isAuthenticated ? <UserDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

