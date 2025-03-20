import { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Button, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { JitsiMeeting } from "@jitsi/react-sdk";
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
  const [error, setError] = useState(null);
  const [meetingId, setMeetingId] = useState("");
  const [isMeetingActive, setIsMeetingActive] = useState(false);

  const API_URL = "http://localhost:3000/team-goals";

  useEffect(() => {
    if (!userId) {
      setError("Please log in to access team goals");
      return;
    }
    fetchGoals();
    fetchUsers();
  }, [userId]);

  const fetchGoals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_URL, { params: { userId }, withCredentials: true });
      if (Array.isArray(response.data)) {
        setGoals(response.data);
      } else {
        console.error("Expected an array for goals, received:", response.data);
        setGoals([]);
        setError("Invalid response format for goals");
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals([]);
      setError("Failed to fetch goals. Please try again.");
      toast.error("Failed to fetch goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`, { withCredentials: true });
      if (Array.isArray(response.data)) {
        setAllUsers(response.data);
      } else {
        console.error("Expected an array for users, received:", response.data);
        setAllUsers([]);
        setError("Invalid response format for users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
      setError("Failed to fetch users. Please try again.");
      toast.error("Failed to fetch users. Please try again.");
    }
  };

  const handleCreateGoal = async () => {
    if (!title || !description || !dueDate) {
      toast.warn("Please fill in all required fields");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const enrichedMembers = members.map((member) => {
        const user = allUsers.find((u) => u._id === member.memberId);
        return {
          memberId: member.memberId,
          task: member.task,
          username: user ? user.username : "Unknown",
        };
      });

      const response = await axios.post(
        API_URL,
        {
          leaderId: userId,
          title,
          description,
          priority,
          dueDate,
          members: enrichedMembers,
        },
        { withCredentials: true }
      );
      setTaskId(response.data.taskId);
      setView("dashboard");
      setSelectedGoal(response.data);
      fetchGoals();
      resetForm();
    } catch (error) {
      console.error("Error creating goal:", error);
      setError("Failed to create goal. Please try again.");
      toast.error("Failed to create goal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedGoal) return;
    setLoading(true);
    setError(null);
    try {
      const enrichedMembers = members.map((member) => {
        const user = allUsers.find((u) => u._id === member.memberId);
        return {
          memberId: member.memberId,
          task: member.task,
          username: user ? user.username : "Unknown",
        };
      });

      const memberUrl = `${API_URL}/${selectedGoal.taskId}/members`;
      await axios.put(memberUrl, { members: enrichedMembers }, { withCredentials: true });
      const response = await axios.get(`${API_URL}/${selectedGoal.taskId}`, { withCredentials: true });
      setSelectedGoal(response.data);
      setMembers([{ memberId: "", task: "" }]);
    } catch (error) {
      console.error("Error adding member:", error);
      setError("Failed to add member. Please try again.");
      toast.error("Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (content) => {
    if (!content || !selectedGoal) return;
    setLoading(true);
    setError(null);
    try {
      const commentUrl = `${API_URL}/${selectedGoal.taskId}/comments`;
      const response = await axios.post(
        commentUrl,
        {
          userId,
          username,
          content,
        },
        { withCredentials: true }
      );
      setSelectedGoal({ ...response.data });
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment. Please try again.");
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    setLoading(true);
    setError(null);
    try {
      await axios.put(
        `${API_URL}/${selectedGoal.taskId}/comments/${commentId}`,
        { content: newContent },
        { withCredentials: true }
      );
      const response = await axios.get(`${API_URL}/${selectedGoal.taskId}`, { withCredentials: true });
      setSelectedGoal(response.data);
    } catch (error) {
      console.error("Error editing comment:", error);
      setError("Failed to edit comment. Please try again.");
      toast.error("Failed to edit comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_URL}/${selectedGoal.taskId}/comments/${commentId}`, { withCredentials: true });
      const response = await axios.get(`${API_URL}/${selectedGoal.taskId}`, { withCredentials: true });
      setSelectedGoal({ ...response.data });
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment. Please try again.");
      toast.error("Failed to delete comment. Please try again.");
    } finally {
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

  const startMeeting = async () => {
    if (!userId || !selectedGoal) {
      toast.error("Please select a goal to start a meeting");
      return;
    }

    const newMeetingId = `FocusFuze_${selectedGoal.taskId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    setMeetingId(newMeetingId);
    setIsMeetingActive(true);

    const meetingComment = `Meeting started! Join with Meeting ID: ${newMeetingId}`;
    await handleAddComment(meetingComment);

    setView("meeting");
    toast.success(`Meeting ${newMeetingId} started for goal ${selectedGoal.title}`);
  };

  const joinMeeting = async () => {
    if (!meetingId || !selectedGoal) {
      toast.warn("Please enter a meeting ID and select a goal");
      return;
    }

    setIsMeetingActive(true);
    setView("meeting");
    toast.info(`Joined meeting ${meetingId} for goal ${selectedGoal.title}`);
  };

  const leaveMeeting = () => {
    setIsMeetingActive(false);
    setMeetingId("");
    setView("dashboard");
    toast.info("Left the meeting");
  };

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
          {error && <p className="error-message" style={{ color: "red", textAlign: "center" }}>{error}</p>}

          {view === "main" && (
            <div className="team-goal-main">
              <h2 className="team-goal-heading">Team Goals</h2>
              <div className="team-goal-options">
                <button className="team-goal-btn" onClick={() => setView("create")}>
                  Create a Goal
                </button>
              </div>
              <div className="team-goal-list">
                {goals && goals.length > 0 ? (
                  goals.map((goal) => (
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
                  ))
                ) : (
                  <Typography variant="body1">No goals found. Create a new goal to get started!</Typography>
                )}
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
                <div className="team-goal-meeting">
                  <Typography variant="h6">Meeting</Typography>
                  {isLeader ? (
                    <Button variant="contained" onClick={startMeeting} style={{ margin: "10px 0" }}>
                      Start Meeting
                    </Button>
                  ) : (
                    <>
                      <TextField
                        label="Meeting ID"
                        value={meetingId}
                        onChange={(e) => setMeetingId(e.target.value)}
                        fullWidth
                        style={{ margin: "10px 0" }}
                      />
                      <Button variant="contained" onClick={joinMeeting} style={{ margin: "10px 0" }}>
                        Join Meeting
                      </Button>
                    </>
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
                <button className="team-goal-comment-btn" onClick={() => handleAddComment(comment)}>
                  Add Comment
                </button>
              </div>
            </div>
          )}

          {view === "meeting" && selectedGoal && (
            <div className="team-goal-meeting-view">
              <Typography variant="h5">Meeting for Goal: {selectedGoal.title}</Typography>
              <Typography variant="subtitle1">Meeting ID: {meetingId}</Typography>
              <div className="video-meeting-container">
                <JitsiMeeting
                  domain="jitsi.riot.im" // Use a different public server
                  roomName={meetingId}
                  configOverwrite={{
                    disableThirdPartyRequests: true,
                    startWithAudioMuted: true,
                    startWithVideoMuted: true,
                    prejoinPageEnabled: false,
                    startWithoutVideo: true,
                    enableWelcomePage: false,
                    enableNoisyMicDetection: false,
                    enableClosePage: false,
                    disableInviteFunctions: false,
                    requireDisplayName: true,
                    disableDeepLinking: true,
                    disableLocalVideoFlip: true,
                    disableRemoteVideoMenu: false,
                    disableProfile: true,
                    disableSimulcast: false,
                    enableLayerSuspension: true,
                    disableModeratorIndicator: false,
                    enableNoAudioDetection: true,
                    enableAutomaticUrlCopy: false,
                    disablePolls: true,
                    disableReactions: true,
                    disableSelfView: false,
                    notifications: [],
                    toolbarButtons: [
                      "microphone",
                      "camera",
                      "closedcaptions",
                      "desktop",
                      "fullscreen",
                      "fodeviceselection",
                      "hangup",
                      "chat",
                      "recording",
                      "livestreaming",
                      "etherpad",
                      "sharedvideo",
                      "settings",
                      "raisehand",
                      "videoquality",
                      "filmstrip",
                      "feedback",
                      "stats",
                      "shortcuts",
                      "tileview",
                      "download",
                      "help",
                      "mute-everyone",
                      "security",
                    ],
                  }}
                  interfaceConfigOverwrite={{
                    SHOW_JITSI_WATERMARK: false,
                    SHOW_WATERMARK_FOR_GUESTS: false,
                    DEFAULT_LOGO_URL: "",
                    SHOW_BRAND_WATERMARK: false,
                    SHOW_POWERED_BY: false,
                  }}
                  userInfo={{
                    displayName: username || "Guest",
                    email: "",
                  }}
                  getIFrameRef={(iframeRef) => {
                    iframeRef.style.height = "500px";
                    iframeRef.style.width = "100%";
                    iframeRef.style.border = "none";
                  }}
                  onApiReady={(externalApi) => {
                    console.log("Jitsi Meet API ready:", externalApi);
                    externalApi.addEventListener("videoConferenceJoined", (event) => {
                      console.log("User joined conference:", event);
                    });
                    externalApi.addEventListener("videoConferenceLeft", () => {
                      console.log("User left conference");
                      leaveMeeting();
                    });
                    externalApi.addEventListener("participantRoleChanged", (event) => {
                      console.log("Participant role changed:", event);
                    });
                    externalApi.addEventListener("readyToClose", () => {
                      console.log("Meeting is ready to close");
                      leaveMeeting();
                    });
                    externalApi.addEventListener("errorOccurred", (event) => {
                      console.error("Jitsi Meet error:", event);
                      toast.error("An error occurred in the meeting. Please try again.");
                    });
                    externalApi.addEventListener("participantJoined", (event) => {
                      console.log("Participant joined:", event);
                    });
                    externalApi.addEventListener("participantLeft", (event) => {
                      console.log("Participant left:", event);
                    });
                    externalApi.addEventListener("authenticationRequired", () => {
                      console.log("Authentication required for the meeting");
                      toast.error("Authentication required. Please try starting a new meeting.");
                    });
                  }}
                />
              </div>
              <Button variant="contained" onClick={leaveMeeting} color="error" style={{ marginTop: "20px" }}>
                Leave Meeting
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeamGoalPage;