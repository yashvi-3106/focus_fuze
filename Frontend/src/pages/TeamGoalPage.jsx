import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import { Buffer } from "buffer";
import { Button, TextField, Typography } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./TeamGoalPage.css";

// Polyfill Buffer globally
window.Buffer = Buffer;

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
  const [meetingId, setMeetingId] = useState("");
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [peers, setPeers] = useState({});
  const [myStream, setMyStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [mediaError, setMediaError] = useState(null); // Track media access errors
  const socketRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef(null);
  const mediaAccessRequested = useRef(false); // Prevent multiple media requests

  const API_URL = "http://localhost:3000/team-goals";

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMyStream(null);
      mediaAccessRequested.current = false;
    }
  };

  const requestMediaAccess = async () => {
    if (mediaAccessRequested.current || streamRef.current) return; // Avoid multiple requests
    mediaAccessRequested.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setMyStream(stream);
      setMediaError(null);
    } catch (err) {
      console.error("Media access error:", err);
      setMediaError(err.name);
      toast.error(
        "Failed to access camera/microphone. Ensure no other app is using them or retry.",
        { autoClose: false }
      );
      mediaAccessRequested.current = false;
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchUsers();
    initializeSocket();

    // Cleanup on unmount
    return () => {
      stopMediaStream();
      socketRef.current?.disconnect();
    };
  }, []);

  const initializeSocket = () => {
    socketRef.current = io("http://localhost:3000", { withCredentials: true });

    socketRef.current.on("connect", () => console.log("Connected to Socket.IO"));
    socketRef.current.on("connect_error", (error) => console.error("Connection error:", error.message));
    socketRef.current.emit("authenticate", userId);

    socketRef.current.on("updateUserList", (userList) => {
      // Optionally use for member presence
    });

    socketRef.current.on("meetingStarted", (data) => {
      if (data.goalId === selectedGoal?.taskId) {
        setMeetingId(data.meetingId);
        toast.info(`Meeting ${data.meetingId} started by ${data.leaderName} for goal ${data.goalId}`);
      }
    });

    socketRef.current.on("userJoinedMeeting", (data) => {
      if (isMeetingActive && data.userId !== userId && selectedGoal?.taskId === data.goalId) {
        createPeer(data.userId, socketRef.current.id, data.socketId);
      }
    });

    socketRef.current.on("updateParticipants", (participantsList) => {
      setParticipants(participantsList);
    });

    socketRef.current.on("userDisconnected", (data) => {
      if (peers[data.userId]) {
        peers[data.userId].peer.destroy();
        const newPeers = { ...peers };
        delete newPeers[data.userId];
        setPeers(newPeers);
      }
    });

    socketRef.current.on("signal", (data) => {
      if (peers[data.from]) {
        peers[data.from].peer.signal(data.signal);
      } else {
        createPeer(data.from, socketRef.current.id, null, data.signal);
      }
    });
  };

  const createPeer = (userId, callerId, recipientId, signal) => {
    const peer = new SimplePeer({
      initiator: callerId === socketRef.current.id,
      trickle: false,
      stream: streamRef.current,
    });

    if (signal) peer.signal(signal);

    peer.on("signal", (signal) => {
      socketRef.current.emit("signal", { to: recipientId || null, signal });
    });

    peer.on("stream", (stream) => {
      setPeers((prev) => ({ ...prev, [userId]: { peer, stream } }));
    });

    peer.on("error", (err) => console.error("Peer error:", err));

    peersRef.current[userId] = peer;
    setPeers((prev) => ({ ...prev, [userId]: { peer } }));
  };

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
      const enrichedMembers = members.map((member) => {
        const user = allUsers.find((u) => u._id === member.memberId);
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

  const handleAddMember = async () => {
    if (!selectedGoal) return;
    setLoading(true);
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
      await axios.put(memberUrl, { members: enrichedMembers });
      const response = await axios.get(`${API_URL}/${selectedGoal.taskId}`);
      setSelectedGoal(response.data);
      setMembers([{ memberId: "", task: "" }]);
      setLoading(false);
    } catch (error) {
      console.error("Error adding member:", error);
      setLoading(false);
    }
  };

  const handleAddComment = async (content) => {
    if (!content || !selectedGoal) return;
    setLoading(true);
    try {
      const commentUrl = `${API_URL}/${selectedGoal.taskId}/comments`;
      const response = await axios.post(commentUrl, {
        userId,
        username,
        content,
      });
      setSelectedGoal({ ...response.data });
      setComment("");
      setLoading(false);
    } catch (error) {
      console.error("Error adding comment:", error);
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
      await axios.delete(`${API_URL}/${selectedGoal.taskId}/comments/${commentId}`);
      const response = await axios.get(`${API_URL}/${selectedGoal.taskId}`);
      setSelectedGoal({ ...response.data });
      setLoading(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
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
    if (!userId || !selectedGoal) return toast.error("Please select a goal to start a meeting");

    // Request media access before starting the meeting
    await requestMediaAccess();
    if (!streamRef.current) return; // Stop if media access failed

    const newMeetingId = `meeting_${Date.now()}_${selectedGoal.taskId}`;
    setMeetingId(newMeetingId);
    setIsMeetingActive(true);
    socketRef.current.emit("initiateMeeting", {
      leaderId: userId,
      meetingId: newMeetingId,
      goalId: selectedGoal.taskId,
    });

    const meetingComment = `Meeting started! Join with Meeting ID: ${newMeetingId}`;
    await handleAddComment(meetingComment);

    setView("meeting");
    toast.success(`Meeting ${newMeetingId} started for goal ${selectedGoal.title}`);
  };

  const joinMeeting = async () => {
    if (!meetingId || !selectedGoal) return toast.warn("Please enter a meeting ID and select a goal");

    // Request media access before joining the meeting
    await requestMediaAccess();
    if (!streamRef.current) return; // Stop if media access failed

    socketRef.current.emit("joinMeeting", { meetingId, userId, goalId: selectedGoal.taskId });
    setIsMeetingActive(true);
    setView("meeting");
    toast.info(`Joined meeting ${meetingId} for goal ${selectedGoal.title}`);
  };

  const leaveMeeting = () => {
    setIsMeetingActive(false);
    setMeetingId("");
    Object.values(peers).forEach(({ peer }) => peer.destroy());
    setPeers({});
    setParticipants([]);
    socketRef.current.emit("leaveMeeting", { meetingId, userId });
    stopMediaStream(); // Stop the media stream when leaving
    setView("dashboard");
    toast.info("Left the meeting");
  };

  const retryMediaAccess = async () => {
    stopMediaStream(); // Stop any existing stream
    await requestMediaAccess();
  };

  return (
    <div className="team-goal-container">
      <ToastContainer position="top-right" autoClose={3000} />
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
                <button className="team-goal-btn" onClick={() => setView("create")}>
                  Create a Goal
                </button>
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
              {mediaError && (
                <div style={{ margin: "10px 0", color: "red" }}>
                  <Typography variant="body1">Media access error: {mediaError}</Typography>
                  <Button variant="outlined" onClick={retryMediaAccess} style={{ marginTop: "10px" }}>
                    Retry Media Access
                  </Button>
                </div>
              )}
              <Typography variant="h6" style={{ marginTop: "10px" }}>
                Participants ({participants.length}):
              </Typography>
              <div className="video-container">
                {streamRef.current && !mediaError && (
                  <div className="video-wrapper" key={`${userId}-local-${Date.now()}`}>
                    <Typography variant="body2" style={{ textAlign: "center" }}>
                      {username} (You{isLeader ? ", Leader" : ""})
                    </Typography>
                    <video
                      ref={(video) => {
                        if (video && streamRef.current) video.srcObject = streamRef.current;
                      }}
                      autoPlay
                      muted
                      style={{ width: "300px", height: "200px", backgroundColor: "black" }}
                    />
                  </div>
                )}
                {Object.entries(peers).map(([peerUserId, { stream }], index) => {
                  const participant = participants.find((p) => p.userId === peerUserId);
                  if (!participant || !stream) return null;
                  return (
                    <div key={`${peerUserId}-${index}-${Date.now()}`} className="video-wrapper">
                      <Typography variant="body2" style={{ textAlign: "center" }}>
                        {participant.userName} {participant.isLeader ? "(Leader)" : ""}
                      </Typography>
                      <video
                        ref={(video) => {
                          if (video && stream) video.srcObject = stream;
                        }}
                        autoPlay
                        style={{ width: "300px", height: "200px", backgroundColor: "black" }}
                      />
                    </div>
                  );
                })}
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