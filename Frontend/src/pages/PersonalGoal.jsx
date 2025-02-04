import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./PersonalGoal.css";

const PersonalGoal = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "",
    rewardPoints: "",
    status: "Not Started",
  });

  const [editingGoal, setEditingGoal] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get("https://focus-fuze.onrender.com/personal-goals");
      setGoals(response.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
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
      alert("Please fill in all required fields!");
      return;
    }

    try {
      const response = await axios.post("https://focus-fuze.onrender.com/personal-goals", newGoal);
      fetchGoals(); // Re-fetch goals after creation
      resetForm();
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  const deleteGoal = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this goal?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://focus-fuze.onrender.com/personal-goals/_id/${id}`);
      fetchGoals(); // Re-fetch goals after deletion
    } catch (error) {
      console.error("Error deleting goal:", error);
      alert("Failed to delete goal. Please check the API endpoint.");
    }
  };

  const editGoal = (goal) => {
    setEditingGoal(goal._id);
    setNewGoal({ ...goal });
  };

  const updateGoal = async () => {
    if (!editingGoal) return;

    try {
      const { _id, ...updatedGoalData } = newGoal;
      await axios.patch(
        `https://focus-fuze.onrender.com/personal-goals/_id/${editingGoal}`,
        updatedGoalData
      );
      fetchGoals(); // Re-fetch goals after update
      setEditingGoal(null);
      resetForm();
    } catch (error) {
      console.error("Error updating goal:", error);
      alert("Failed to update goal. Please check the API.");
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

  // Handle Mark as Complete
  const markAsComplete = async (id) => {
    try {
      await axios.patch(
        `https://focus-fuze.onrender.com/personal-goals/_id/${id}`,
        { status: "Completed" }
      );
      fetchGoals(); // Re-fetch goals after marking as complete
    } catch (error) {
      console.error("Error marking goal as complete:", error);
      alert("Failed to mark goal as complete.");
    }
  };

  // Handle Claim Reward
  const claimReward = async (id) => {
    try {
      await axios.patch(
        `https://focus-fuze.onrender.com/personal-goals/_id/${id}`,
        { rewardStatus: "Claimed" }
      );
      fetchGoals(); // Re-fetch goals after claiming reward
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Failed to claim reward.");
    }
  };

  return (
    <div className="container3">
      <div className="section2">
        <div className="img2">
          <img src="https://static.vecteezy.com/system/resources/previews/041/172/156/non_2x/goal-setting-visualization-flat-illustration-vector.jpg" />
        </div>
        <div className="goal-text1">
          <p>Personal Success Hub</p>
        </div>
        <div className="goal-text2">
          <p>Set Up & Achieve</p>
        </div>
        <div className="goal-text3">
          <p>Define your goals, take action, and make every day a step toward the future you deserve. Start your journey today!</p>
        </div>
      </div>

      <div className="form-data">
        <div className="input">
          <div className="goal">Create New Goal</div>

          <div className="txt">Goal Title </div>
          <input type="text" name="title" value={newGoal.title} onChange={handleInputChange} placeholder="Title" className="title" />

          <div className="txt">Description</div>
          <input type="text" name="description" value={newGoal.description} onChange={handleInputChange} placeholder="Description" className="description" />

          <div className="goal-input-row">
            <div className="goal-input">
              <label className="goal-label">Deadline</label>
              <div className="goal-field">
                <input type="date" name="deadline" value={newGoal.deadline} onChange={handleInputChange} />
              </div>
            </div>

            <div className="goal-input">
              <label className="goal-label">Priority</label>
              <div className="goal-field">
                <select name="priority" value={newGoal.priority} onChange={handleInputChange}>
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="goal-input">
              <label className="goal-label">Reward Points</label>
              <div className="goal-field">
                <input type="number" name="rewardPoints" value={newGoal.rewardPoints} onChange={handleInputChange} placeholder="Reward Points" />
              </div>
            </div>
          </div>

          <button onClick={editingGoal ? updateGoal : addGoal} className="btn1">
            {editingGoal ? "Update Goal" : "Create Goal"}
          </button>
        </div>
      </div>

      <div className="add-goal">
        {goals.map((goal) => (
          <div key={goal._id} className="goal-card">
            <p className="txt5">Title : {goal.title}</p>
            <p className="txt7">Priority: {goal.priority}</p>
            <p className="txt8">Reward Points: {goal.rewardPoints}</p>

            <div className="goal-actions">
              <button
                onClick={() => markAsComplete(goal._id)}
                className="btn-complete"
                disabled={goal.status === "Completed"}
              >
                {goal.status === "Completed" ? "Completed" : "Mark as Complete"}
              </button>

              <button
                onClick={() => claimReward(goal._id)}
                className="btn-reward"
                disabled={goal.rewardStatus === "Claimed"}
              >
                {goal.rewardStatus === "Claimed" ? "Reward Claimed" : "Claim Reward"}
              </button>

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
