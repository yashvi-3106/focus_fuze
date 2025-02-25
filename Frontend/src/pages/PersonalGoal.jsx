import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./PersonalGoal.css";

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
    }
  }, [userId]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/personal-goals/${userId}`);
      setTimeout(() => {
        setGoals(response.data);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setLoading(false);
      toast.error("Failed to fetch goals.");
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

    setLoading(true);
    try {
      await axios.post("http://localhost:3000/personal-goals", { ...newGoal, userId });
      setTimeout(() => {
        fetchGoals();
        resetForm();
        setLoading(false);
        toast.success("Goal added successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error adding goal:", error);
      setLoading(false);
      toast.error("Failed to add goal.");
    }
  };

  const deleteGoal = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3000/personal-goals/${id}`);
      setTimeout(() => {
        fetchGoals();
        setLoading(false);
        toast.success("Goal deleted successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal.");
      setLoading(false);
    }
  };

  const editGoal = (goal) => {
    setEditingGoal(goal._id);
    setNewGoal({ ...goal });
  };

  const updateGoal = async () => {
    if (!editingGoal) return;

    setLoading(true);
    try {
      const { _id, ...updatedGoalData } = newGoal;
      await axios.put(`http://localhost:3000/personal-goals/${editingGoal}`, updatedGoalData);
      setTimeout(() => {
        fetchGoals();
        setEditingGoal(null);
        resetForm();
        setLoading(false);
        toast.success("Goal updated successfully!");
      }, 1000);
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error("Failed to update goal.");
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

  return (
    <div className="container9">
      <div className="hero-section1">
        <div className="container1">
          <h2 className="hero-title1">Personal Goal</h2>
          <p className="hero-description1">
            Organize. Prioritize. Achieve. <br />
            Manage your tasks with ease <br /> and accomplish more every day.
          </p>
          <button onClick={() => navigate("/blog")} className="cta-button1">
            Get Started
          </button>
        </div>

        <div className="background-overlay1">
          <div className="background-image"></div>
          <div className="gradient-overlay1"></div>
          <div className="circle-effect circle-one"></div>
          <div className="circle-effect circle-two"></div>
          <div className="circle-effect circle-three"></div>
        </div>
      </div>

      {loading && (
        <div className="loader-container">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading..."
            className="loader"
          />
        </div>
      )}

      <div className="personal-form">
        <div className="personal-goal">
          <h3>{editingGoal ? "Edit Goal" : "Create New Goal"}</h3>
          <p className="title1">Goal Title</p>
          <input
            type="text"
            name="title"
            value={newGoal.title}
            onChange={handleInputChange}
            placeholder="Title"
            className="title2"
          />

          <p className="title1">Description</p>
          <input
            type="text"
            name="description"
            value={newGoal.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="title3"
          />

          <div className="flex">
            <div>
              <p className="title1">Deadline</p>
              <input
                type="date"
                name="deadline"
                value={newGoal.deadline}
                onChange={handleInputChange}
                className="title4"
              />
            </div>

            <div>
              <p className="title1">Priority</p>
              <select
                name="priority"
                value={newGoal.priority}
                onChange={handleInputChange}
                className="title5"
              >
                <option value="">Select Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <p className="title1">Reward Points</p>
              <input
                className="title6"
                type="number"
                name="rewardPoints"
                value={newGoal.rewardPoints}
                onChange={handleInputChange}
                placeholder="Reward Points"
              />
            </div>
          </div>
          <button onClick={editingGoal ? updateGoal : addGoal} className="goal1">
            {editingGoal ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </div>

      <div className="goal-cards-container">
        {!loading &&
          goals.map((goal) => (
            <div key={goal._id} className="goal-card">
              <p className="txt5">Title: {goal.title}</p>
              <p className="txt7">Priority: {goal.priority}</p>
              <p className="txt8">Reward Points: {goal.rewardPoints}</p>

              <div className="goal-actions">
                <button onClick={() => deleteGoal(goal._id)} className="btn-delete">
                  <FaTrash />
                </button>
                <button onClick={() => editGoal(goal)} className="btn-edit">
                  <FaEdit />
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PersonalGoal;
