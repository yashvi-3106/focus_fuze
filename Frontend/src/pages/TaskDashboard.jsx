import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const TaskDashboard = () => {
  const { taskId } = useParams(); // Get the taskId from the URL
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch task data from backend
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await axios.get(`https://focus-fuze.onrender.com/team-goals/task-dashboard/${taskId}`);
        setTask(response.data); // Store the task data in state
        setLoading(false); // Set loading to false after data is fetched
      } catch (err) {
        console.error("Error fetching task details:", err);
        setError("Error fetching task details");
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]); // Re-run the effect if taskId changes

  if (loading) return <div>Loading...</div>; // Show loading message while fetching data
  if (error) return <div>{error}</div>; // Show error message if any

  return (
    <div>
      <h1>Task Dashboard</h1>
      {task && (
        <div>
          <h2>Task Details</h2>
          <p><strong>Task ID:</strong> {task.taskId}</p>
          <p><strong>Title:</strong> {task.title}</p>
          <p><strong>Description:</strong> {task.description}</p>
          <p><strong>Due Date:</strong> {task.dueDate}</p>
          <p><strong>Priority:</strong> {task.priority}</p>

          <h3>Members:</h3>
          <ul>
            {task.members.map((member, idx) => (
              <li key={idx}>
                <strong>{member.name}</strong>: {member.assignedTask} - {member.completed ? "Completed" : "Pending"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TaskDashboard;
