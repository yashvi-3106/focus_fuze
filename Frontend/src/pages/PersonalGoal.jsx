// 

import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PersonalGoal.css";
import { TiTick } from "react-icons/ti";

const PersonalGoal = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "",
    rewardPoints: "",
    status: "Not Started",
  });
  const [editingGoal, setEditingGoal] = useState(null);
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const navigate = useNavigate();

  useEffect(() => {
    if (userId) {
      fetchGoals();
    } else {
      toast.error("User not authenticated. Please log in.");
      navigate("/login"); // Redirect to login if no userId
    }

    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });

    const interval = setInterval(checkDueDates, 60 * 60 * 1000);
    checkDueDates();
    return () => clearInterval(interval);
  }, [userId, navigate]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`https://focus-fuze.onrender.com/personal-goals/${userId}`);
      setTimeout(() => {
        setGoals(response.data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching goals:", error.response?.data, error.message);
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to fetch goals.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal((prevGoal) => ({
      ...prevGoal,
      [name]: value,
    }));
  };

  const addGoal = async () => {
    if (!newGoal.title || !newGoal.description || !newGoal.deadline || !newGoal.priority) {
      toast.error("Please fill in all required fields!");
      return;
    }
    if (!userId) {
      toast.error("User not authenticated. Please log in.");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...newGoal,
        userId,
        rewardPoints: newGoal.rewardPoints ? parseInt(newGoal.rewardPoints, 10) : undefined,
      };
      console.log("Add Goal Payload:", payload);
      await axios.post("https://focus-fuze.onrender.com/personal-goals", payload, {
        headers: {
          "Content-Type": "application/json",
          // Add if authentication is required: Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTimeout(() => {
        fetchGoals();
        resetForm();
        setLoading(false);
        toast.success("Goal added successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error adding goal:", error.response?.data, error.message);
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to add goal.");
    }
  };

  const deleteGoal = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`https://focus-fuze.onrender.com/personal-goals/${id}`, {
        headers: {
          // Add if authentication is required: Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTimeout(() => {
        fetchGoals();
        setLoading(false);
        toast.success("Goal deleted successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error deleting goal:", error.response?.data, error.message);
      toast.error(error.response?.data?.message || "Failed to delete goal.");
      setLoading(false);
    }
  };

  const editGoal = (goal) => {
    setEditingGoal(goal._id);
    setNewGoal({ ...goal, rewardPoints: goal.rewardPoints || "" });
  };

  const markAsComplete = async (goalId) => {
    try {
      const response = await axios.put(
        `https://focus-fuze.onrender.com/personal-goals/${goalId}/complete`,
        { status: "Completed" },
        {
          headers: {
            "Content-Type": "application/json",
            // Add if authentication is required: Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setGoals((prevGoals) =>
        prevGoals.map((goal) =>
          goal._id === goalId ? response.data : goal
        )
      );

      toast.success("Goal marked as complete!");
    } catch (error) {
      console.error("Error updating goal:", error.response?.data, error.message);
      toast.error(error.response?.data?.message || "Failed to mark goal as complete.");
    }
  };

  const updateGoal = async () => {
    if (!editingGoal) return;

    setLoading(true);
    try {
      const { _id, ...updatedGoalData } = newGoal;
      const payload = {
        ...updatedGoalData,
        rewardPoints: newGoal.rewardPoints ? parseInt(newGoal.rewardPoints, 10) : undefined,
      };
      console.log("Update Goal Payload:", payload);
      await axios.put(`https://focus-fuze.onrender.com/personal-goals/${editingGoal}`, payload, {
        headers: {
          "Content-Type": "application/json",
          // Add if authentication is required: Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setTimeout(() => {
        fetchGoals();
        setEditingGoal(null);
        resetForm();
        setLoading(false);
        toast.success("Goal updated successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error updating goal:", error.response?.data, error.message);
      toast.error(error.response?.data?.message || "Failed to update goal.");
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewGoal({
      title: "",
      description: "",
      deadline: "",
      priority: "",
      rewardPoints: "",
      status: "Not Started",
    });
  };

  const checkDueDates = () => {
    if (Notification.permission !== "granted") {
      console.log("Notifications not permitted");
      return;
    }

    console.log("Checking due dates...");
    const now = new Date();
    goals.forEach((goal) => {
      const deadline = new Date(goal.deadline);
      const timeDiff = deadline - now;
      const hoursLeft = Math.ceil(timeDiff / (1000 * 60 * 60));
      console.log(`Goal: ${goal.title}, Hours Left: ${hoursLeft}`);

      if (hoursLeft > 0 && hoursLeft <= 24) {
        new Notification("FocusFuze Reminder", {
          body: `Goal "${goal.title}" is due in ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"}!`,
          icon: "https://img.freepik.com/free-vector/goal-achievement-career-promotion-school-graduation-motivation-business-achievement-concept_335657-925.jpg",
        });
        console.log(`Notification sent: ${goal.title} due in ${hoursLeft} hours`);
      } else if (timeDiff <= 0) {
        new Notification("FocusFuze Reminder", {
          body: `Goal "${goal.title}" is overdue!`,
          icon: "https://img.freepik.com/free-vector/goal-achievement-career-promotion-school-graduation-motivation-business-achievement-concept_335657-925.jpg",
        });
        console.log(`Notification sent: ${goal.title} is overdue`);
      }
    });
  };

  return (
    <div className="personal-goal-container">
      <section className="goal-form-section">
        <h2 className="section-title">
          {editingGoal ? "Edit Your Goal" : "Set a New Goal"}
        </h2>
        <p className="section-subtitle">Plan Your Path to Success</p>
        <div className="goal-form">
          <label className="form-label">Goal Title</label>
          <input
            type="text"
            name="title"
            value={newGoal.title}
            onChange={handleInputChange}
            placeholder="Enter your goal title"
            className="form-input"
          />

          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={newGoal.description}
            onChange={handleInputChange}
            placeholder="Describe your goal"
            className="form-textarea"
          />

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={newGoal.deadline}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={newGoal.priority}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <label className="form-label">Reward Points</label>
          <input
            type="number"
            name="rewardPoints"
            value={newGoal.rewardPoints}
            onChange={handleInputChange}
            placeholder="Add reward points"
            className="form-input"
          />

          <button
            onClick={editingGoal ? updateGoal : addGoal}
            className="form-btn"
          >
            {editingGoal ? "Update Goal" : "Add Goal"}
          </button>
        </div>
      </section>

      <section className="goal-list-section">
        <h2 className="section-title">Your Goals</h2>
        <p className="section-subtitle">Track Your Progress</p>
        <div className="goal-list">
          {loading ? (
            <div className="loader-container">
              <img
                src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
                alt="Loading..."
                className="loader"
              />
            </div>
          ) : goals.length === 0 ? (
            <p className="no-goals">No goals yet. Start by adding one!</p>
          ) : (
            goals.map((goal) => (
              <div key={goal._id} className="goal-box">
                <h3 className="goal-title">{goal.title}</h3>
                <p className="goal-desc">{goal.description}</p>
                <div className="goal-details">
                  <span className={`goal-priority ${goal.priority.toLowerCase()}`}>
                    {goal.priority}
                  </span>
                  <span className="goal-deadline">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                  {goal.rewardPoints && (
                    <span className="goal-reward">
                      Reward: {goal.rewardPoints} pts
                    </span>
                  )}
                </div>
                <button
                  onClick={() => editGoal(goal)}
                  className="action-btn edit-btn"
                >
                  <FaEdit /> Edit
                </button>

                <button
                  onClick={() => markAsComplete(goal._id)}
                  className={`action-btn ${goal.status === "Completed" ? "disabled-btn" : "completed-btn"}`}
                  disabled={goal.status === "Completed"}
                >
                  {goal.status === "Completed" ? (
                    <>
                      <TiTick /> Task Completed
                    </>
                  ) : (
                    <>
                      <TiTick /> Mark as Complete
                    </>
                  )}
                </button>

                <button
                  onClick={() => deleteGoal(goal._id)}
                  className="action-btn delete-btn"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PersonalGoal;