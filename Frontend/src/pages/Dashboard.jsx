import { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Dashboard.css"; // Import CSS

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    pendingTasks: 0,
    completedTasks: 0,
    recentNotes: [],
  });
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:3000/dashboard/${userId}`);
        console.log("Fetched Dashboard Data:", response.data); // Debugging
        setDashboardData(response.data); // Ensure data is correctly set
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userId]); // Ensure fetch happens when userId changes

  if (loading) return <p className="loading-text">Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      {/* Left Column: Task Summary + Recent Notes */}
      <div className="left-column">
        {/* Task Summary Box */}
        <div className="task-summary-box">
          <h2>Task Summary</h2>
          <div className="task-summary">
            <div className="task-item">
              <span className="task-label pending">Pending Tasks:</span>
              <span className="task-count">{dashboardData.pendingTasks}</span>
            </div>
            <div className="task-item">
              <span className="task-label completed">Completed Tasks:</span>
              <span className="task-count">{dashboardData.completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Recent Notes Section */}
        <div className="recent-notes">
          <h2>Recent Notes</h2>
          {dashboardData.recentNotes.length > 0 ? (
            <ul>
              {dashboardData.recentNotes.map((note, index) => (
                <li key={index}>{note.title}</li>
              ))}
            </ul>
          ) : (
            <p>No recent notes</p>
          )}
        </div>
      </div>

      {/* Right Column: Activity Graph */}
      <div className="right-column">
        <div className="activity-graph">
          <h2>Activity Graph</h2>
          <Bar
            data={{
              labels: dashboardData.recentNotes.map((entry) => entry.createdAt) || [],
              datasets: [
                {
                  label: "Tasks Created",
                  data: [dashboardData.pendingTasks, dashboardData.completedTasks],
                  backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
