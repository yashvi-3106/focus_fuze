import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import "./TeamGoalPage.css";

const TeamGoalPage = () => {
  const [view, setView] = useState("main");
  const [goals, setGoals] = useState([]);
  const [taskId, setTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [members, setMembers] = useState([{ memberId: "", task: "" }]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [comment, setComment] = useState("");
  const [userId] = useState(localStorage.getItem("userId") || "");
  const [username] = useState(localStorage.getItem("username") || "");
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3000/team-goals";

  useEffect(() => {
    fetchGoals();
    fetchUsers();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { params: { userId } });
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setAllUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleCreateGoal = async () => {
    if (!title || !description || !dueDate) return;
    setLoading(true);
    try {
      const enrichedMembers = members.map(member => {
        const user = allUsers.find(u => u._id === member.memberId);
        return {
          memberId: member.memberId,
          task: member.task,
          username: user ? user.username : "Unknown",
        };
      });

      const response = await axios.post(API_URL, {
        leaderId: userId,
        title,
        description,
        priority,
        dueDate,
        members: enrichedMembers,
      });
      setTaskId(response.data.taskId);
      setView("dashboard");
      setSelectedGoal(response.data);
      fetchGoals();
      resetForm();
      setLoading(false);
    } catch (error) {
      console.error("Error creating goal:", error);
      setLoading(false);
    }
  };

  const handleJoinGoal = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/join`, { taskId, userId });
      setSelectedGoal(response.data);
      setView("dashboard");
      fetchGoals();
      setTaskId("");
      setLoading(false);
    } catch (error) {
      console.error("Error joining goal:", error);
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGoal) return;
    setLoading(true);
    try {
      const enrichedMembers = members.map(member => {
        const user = allUsers.find(u => u._id === member.memberId);
        return {
          memberId: member.memberId,
          task: member.task,
          username: user ? user.username : "Unknown",
        };
      });

      const memberUrl = `${API_URL}/${selectedGoal.taskId}/members`;
      console.log("Adding member to URL:", memberUrl);
      console.log("Payload:", { members: enrichedMembers });
      await axios.put(memberUrl, { members: enrichedMembers });
      const response = await axios.get(`${API_URL}/${selectedGoal.taskId}`);
      console.log("Updated goal:", response.data);
      setSelectedGoal(response.data);
      setMembers([{ memberId: "", task: "" }]);
      setLoading(false);
    } catch (error) {
      console.error("Error adding member:", error);
      if (error.response) {
        console.log("Response data:", error.response.data);
        console.log("Response status:", error.response.status);
      }
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment || !selectedGoal) return;
    setLoading(true);
    try {
      const commentUrl = `${API_URL}/${selectedGoal.taskId}/comments`;
      console.log("Adding comment to URL:", commentUrl);
      console.log("Payload:", { userId, username, content: comment });
      const response = await axios.post(commentUrl, {
        userId,
        username,
        content: comment,
      });
      console.log("Post response:", response.data);
      setSelectedGoal({ ...response.data });
      setComment("");
      setLoading(false);
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error.response) {
        console.log("Response data:", error.response.data);
        console.log("Response status:", error.response.status);
      }
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/${selectedGoal.taskId}/comments/${commentId}`, {
        content: newContent,
      });
      const response = await axios.get(`${API_URL}/${selectedGoal.taskId}`);
      setSelectedGoal(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error editing comment:", error);
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setLoading(true);
    try {
      const deleteUrl = `${API_URL}/${selectedGoal.taskId}/comments/${commentId}`;
      console.log("Deleting comment at URL:", deleteUrl);
      const response = await axios.delete(deleteUrl);
      console.log("Delete response:", response.data);
      setSelectedGoal({ ...response.data }); // Update state with returned goal
      setLoading(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
      if (error.response) {
        console.log("Response data:", error.response.data);
        console.log("Response status:", error.response.status);
      }
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setDueDate("");
    setMembers([{ memberId: "", task: "" }]);
  };

  const isLeader = selectedGoal?.leaderId === userId;

  return (
    <div className="team-goal-container">
      {loading && (
        <div className="team-goal-loader-container">
          <img
            src="https://cdn-icons-png.freepik.com/256/11857/11857533.png"
            alt="Loading..."
            className="team-goal-loader"
          />
        </div>
      )}

      {!loading && (
        <>
          {view === "main" && (
            <div className="team-goal-main">
              <h2 className="team-goal-heading">Team Goals</h2>
              <div className="team-goal-options">
                <button
                  className="team-goal-btn"
                  onClick={() => setView("create")}
                >
                  Create a Goal
                </button>
                {/* <div className="join-goal-section">
                  <input
                    type="text"
                    placeholder="Enter Task ID"
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    className="team-goal-input"
                  />
                  <button className="team-goal-btn" onClick={handleJoinGoal}>
                    Join a Goal
                  </button>
                </div> */}
              </div>
              <div className="team-goal-list">
                {goals.map((goal) => (
                  <div
                    key={goal.taskId}
                    className="team-goal-item"
                    onClick={() => {
                      setSelectedGoal(goal);
                      setView("dashboard");
                    }}
                  >
                    <h3>{goal.title}</h3>
                    <p>Role: {goal.leaderId === userId ? "Leader" : "Member"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "create" && (
            <div className="team-goal-create">
              <h2 className="team-goal-heading">Create Team Goal</h2>
              <div className="team-goal-form">
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="team-goal-input"
                />
                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="team-goal-textarea"
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="team-goal-select"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="team-goal-input"
                />
                <div className="team-goal-members">
                  {members.map((member, index) => (
                    <div key={index} className="team-goal-member-row">
                      <select
                        value={member.memberId}
                        onChange={(e) => {
                          const newMembers = [...members];
                          newMembers[index].memberId = e.target.value;
                          setMembers(newMembers);
                        }}
                        className="team-goal-select"
                      >
                        <option value="">Select Member</option>
                        {allUsers.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.username}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Task"
                        value={member.task}
                        onChange={(e) => {
                          const newMembers = [...members];
                          newMembers[index].task = e.target.value;
                          setMembers(newMembers);
                        }}
                        className="team-goal-input"
                      />
                    </div>
                  ))}
                  <button
                    className="team-goal-add-member-btn"
                    onClick={() => setMembers([...members, { memberId: "", task: "" }])}
                  >
                    Add Member
                  </button>
                </div>
                <button className="team-goal-create-btn" onClick={handleCreateGoal}>
                  Create Goal
                </button>
              </div>
            </div>
          )}

          {view === "dashboard" && selectedGoal && (
            <div className="team-goal-dashboard">
              {console.log("Selected Goal:", selectedGoal)}
              <div className="team-goal-info">
                <h2 className="team-goal-heading">Task ID: {selectedGoal.taskId}</h2>
                <p><strong>Title:</strong> {selectedGoal.title}</p>
                <p><strong>Description:</strong> {selectedGoal.description}</p>
                <p><strong>Priority:</strong> {selectedGoal.priority}</p>
                <p><strong>Due Date:</strong> {selectedGoal.dueDate}</p>
                <div className="team-goal-members-section">
                  <h3>Members</h3>
                  {selectedGoal.members.map((member) => (
                    <p key={member.memberId}>
                      {member.username} - {member.task}
                    </p>
                  ))}
                  {isLeader && (
                    <div className="team-goal-add-member">
                      {members.map((member, index) => (
                        <div key={index} className="team-goal-member-row">
                          <select
                            value={member.memberId}
                            onChange={(e) => {
                              const newMembers = [...members];
                              newMembers[index].memberId = e.target.value;
                              setMembers(newMembers);
                            }}
                            className="team-goal-select"
                          >
                            <option value="">Select Member</option>
                            {allUsers.map((user) => (
                              <option key={user._id} value={user._id}>
                                {user.username}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Task"
                            value={member.task}
                            onChange={(e) => {
                              const newMembers = [...members];
                              newMembers[index].task = e.target.value;
                              setMembers(newMembers);
                            }}
                            className="team-goal-input"
                          />
                        </div>
                      ))}
                      <button
                        className="team-goal-add-member-btn"
                        onClick={handleAddMember}
                      >
                        Add Member
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="team-goal-comments">
                <h3>Comments</h3>
                <div className="team-goal-comment-list">
                  {selectedGoal.comments?.map((c) => (
                    <div key={c._id} className="team-goal-comment">
                      <p>
                        <strong>{c.username}</strong> ({c.userId === selectedGoal.leaderId ? "Leader" : "Member"}): {c.content}
                      </p>
                      {c.userId === userId && (
                        <div className="team-goal-comment-actions">
                          <FaEdit
                            className="team-goal-edit-comment"
                            onClick={() => {
                              const newContent = prompt("Edit comment:", c.content);
                              if (newContent) handleEditComment(c._id, newContent);
                            }}
                          />
                          <FaTrash
                            className="team-goal-delete-comment"
                            onClick={() => handleDeleteComment(c._id)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <textarea
                  placeholder="Leave a comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="team-goal-comment-input"
                />
                <button
                  className="team-goal-comment-btn"
                  onClick={handleAddComment}
                >
                  Add Comment
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamGoalPage;