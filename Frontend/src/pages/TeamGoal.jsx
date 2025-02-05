import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./TeamGoal.css"

const TeamGoal = () => {
  const navigate = useNavigate();
  const [isCreateTask, setIsCreateTask] = useState(true); // Toggle between create and join task forms

  // State for creating a task
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "",
    members: [{ memberId: "", name: "", assignedTask: "" }],
  });

  // State for joining a task
  const [taskId, setTaskId] = useState("");
  const [userId, setUserId] = useState(""); // Assuming userId comes from a logged-in user or session

  // Reset newTask when switching to "Create Task"
  useEffect(() => {
    if (isCreateTask) {
      setNewTask({
        title: "",
        description: "",
        dueDate: "",
        priority: "",
        members: [{ memberId: "", name: "", assignedTask: "" }],
      });
    }
  }, [isCreateTask]);

  // Ensure userId is set when the component mounts
  useEffect(() => {
    // Simulate fetching logged-in user's userId
    // Replace this with actual logic for fetching logged-in user ID
    const fetchedUserId = "12345"; // Simulated user ID
    setUserId(fetchedUserId);
  }, []);

  // Handle input change for creating task
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle member input change
  const handleMemberChange = (idx, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...newTask.members];
    updatedMembers[idx][name] = value;
    setNewTask((prev) => ({
      ...prev,
      members: updatedMembers,
    }));
  };

  // Add a new member to the task
  const addMember = () => {
    setNewTask((prev) => ({
      ...prev,
      members: [...prev.members, { memberId: "", name: "", assignedTask: "" }],
    }));
  };

  // Create a new task
  const createTask = async () => {
    if (!userId) {
      alert("User ID is required to create a task.");
      return;
    }

    try {
      // Validate required fields
      if (!newTask.title || !newTask.description || !newTask.dueDate || !newTask.priority || newTask.members.length === 0) {
        alert("Please fill in all required fields and add at least one member.");
        return;
      }

      const response = await axios.post("https://focus-fuze.onrender.com/team-goals", {
        title: newTask.title,
        description: newTask.description,
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        members: newTask.members,
        leaderId: userId, // Ensure userId is passed correctly
      });

      alert(`Task Created! Task ID: ${response.data.taskId}`);
      navigate(`/task-dashboard/${response.data.taskId}`);
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
      alert("Failed to create task");
    }
  };

  // Join an existing task
  const joinTask = async () => {
    try {
      const response = await axios.post("https://focus-fuze.onrender.com/team-goals/tasks/join", {
        taskId,
        userId,
      });
      alert(response.data);
      navigate(`/task-dashboard/${taskId}`);
    } catch (error) {
      console.error("Error joining task:", error.response?.data || error.message);
      alert("Failed to join task");
    }
  };

  // Handle form switch
  const handleFormSwitch = (isCreate) => {
    setIsCreateTask(isCreate);
  };

  return (
    <div className="container9">
      <div className="sub-container9">
        <div className="team-line">Great teams don’t just <br /> work together—they <br /> thrive together.</div>
        
     

      </div>

      <div className="toggle">

        <div className="create-card create-card-1">
        <button onClick={() => handleFormSwitch(true)} >Create Task</button>

        </div>

        <div className="create-card create-card2">
        <button onClick={() => handleFormSwitch(false)} >Join Task</button>

        </div>

      </div>



      <div className="team-form">
      <div className="task-icon">
          <img src="https://png.pngtree.com/png-vector/20230412/ourmid/pngtree-completed-task-line-icon-vector-png-image_6703007.png" alt="" />
        </div>
        {/* <div className="create-task">Create New Task</div> */}
        <div className="create-task">{isCreateTask ? "Create a New Team Goal" : "Join an Existing Task"}</div>
        <div className="fill-details">Fill in the details below to create a new task and assign team members.</div>

        <button onClick={createTask} className="create-task1">Create Task</button>
        


      {/* Toggle between Create Task and Join Task */}
      {/* <button onClick={() => handleFormSwitch(true)}>Create Task</button>
      <button onClick={() => handleFormSwitch(false)}>Join Task</button> */}

      {isCreateTask ? (
        // Create Task Form
        <div className="task-info">
          <div>
            <div className="team-title">Title:</div>
            <input className="title-input"
              type="text"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <div className="team-title">Description:</div>
            <input className="description-input"
              type="text"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <div className="team-title">Due Date:</div>
            <input className="date-input"
              type="date"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="task-priority">Priority:</label>
            {/* <p className="tasx">Priority</p> */}
            <select name="priority"   
              value={newTask.priority}
              onChange={handleInputChange}
              className="priority-input">
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>


          </div>

          <div className="box1">Members</div>
          <button onClick={addMember} className="add-member">Add Member</button>

          {newTask.members.map((member, idx) => (
  <div key={idx} className="member-container">
    <input
      className="member-input"
      placeholder="Member Name"
      type="text"
      name="name"
      value={member.name}
      onChange={(e) => handleMemberChange(idx, e)}
    />
    <input
      className="assigned-input"
      placeholder="Assigned Task"
      type="text"
      name="assignedTask"
      value={member.assignedTask}
      onChange={(e) => handleMemberChange(idx, e)}
    />
  </div>
))}




        </div>
      ) : (
        // Join Task Form
        <div className="join-task-container">
        <div>
          <label>Task ID:</label>
          <input
            type="text"
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
          />
        </div>
        <div>
          <label>User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <button onClick={joinTask}>Join Task</button>
      </div>
      )}
    </div>
    </div>
    
  );
};

export default TeamGoal;