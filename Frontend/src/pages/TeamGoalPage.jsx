import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { io } from "socket.io-client";
import SimplePeer from "simple-peer";
import { Buffer } from "buffer";
import { Button, TextField, Typography } from "@mui/material";
import { toast } from "react-toastify";
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
  const [mediaError, setMediaError] = useState(null);
  const socketRef = useRef();
  const peersRef = useRef({});
  const streamRef = useRef(null);
  const mediaAccessRequested = useRef(false);

  const API_URL = "https://focus-fuze.onrender.com/team-goals";
  const SOCKET_URL = "https://focus-fuze.onrender.com";

  const stopMediaStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setMyStream(null);
      mediaAccessRequested.current = false;
    }
  };

  const requestMediaAccess = async () => {
    if (mediaAccessRequested.current || streamRef.current) return;
    mediaAccessRequested.current = true;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(username || "Unknown User", canvas.width / 2, canvas.height / 2);
      const stream = canvas.captureStream(30);
      streamRef.current = stream;
      setMyStream(stream);
      setMediaError(null);
      console.log("Fake stream created for user:", username);
    } catch (err) {
      console.error("Fake stream error:", err);
      setMediaError(err.name);
      toast.error("Failed to create fake stream. Please try again.", { autoClose: false });
      mediaAccessRequested.current = false;
    }
  };

  useEffect(() => {
    fetchGoals();
    fetchUsers();
    initializeSocket();

    return () => {
      stopMediaStream();
      socketRef.current?.disconnect();
    };
  }, []);

  const initializeSocket = () => {
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      path: "/socket.io",
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to Socket.IO", socketRef.current.id);
      socketRef.current.emit("authenticate", { userId, userName: username });
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error.message);
      toast.error("Failed to connect to real-time server. Check your network or retry.");
    });

    socketRef.current.on("updateUserList", (userList) => {
      console.log("Updated user list:", userList);
    });

    socketRef.current.on("meetingStarted", (data) => {
      console.log("Meeting started event received:", data);
      if (data.goalId === selectedGoal?.taskId) {
        setMeetingId(data.meetingId);
        toast.info(`Meeting ${data.meetingId} started by ${data.leaderName} for goal ${data.goalId}`);
      }
    });

    socketRef.current.on("userJoinedMeeting", (data) => {
      console.log("User joined meeting event received:", data);
      if (data.userId !== userId && selectedGoal?.taskId === data.goalId) {
        console.log(`User ${data.userId} joined meeting ${meetingId}, initiating peer connection`);
        if (streamRef.current) {
          createPeer(data.userId, socketRef.current.id, data.socketId, false);
        } else {
          console.warn("No stream available to initiate peer connection with", data.userId);
        }
      } else {
        console.log("Skipping peer connection initiation:", { userId, dataUserId: data.userId, goalId: selectedGoal?.taskId, dataGoalId: data.goalId });
      }
    });

    socketRef.current.on("updateParticipants", (participantsList) => {
      console.log("Update participants event received:", participantsList);
      setParticipants(participantsList);

      participantsList.forEach((participant) => {
        if (participant.userId !== userId && !peers[participant.userId] && participant.socketId) {
          console.log(`Initiating peer connection with ${participant.userId} (${participant.socketId})`);
          if (streamRef.current) {
            createPeer(participant.userId, socketRef.current.id, participant.socketId, false);
          } else {
            console.warn("No stream available to initiate peer connection with", participant.userId);
          }
        } else {
          console.log("Skipping peer connection for participant:", participant);
        }
      });
    });

    socketRef.current.on("userDisconnected", (data) => {
      console.log("User disconnected event received:", data);
      if (peers[data.userId]) {
        console.log(`User ${data.userId} disconnected, cleaning up peer`);
        peers[data.userId].peer.destroy();
        const newPeers = { ...peers };
        delete newPeers[data.userId];
        setPeers(newPeers);
      }
    });

    socketRef.current.on("signal", (data) => {
      console.log("Signal event received:", data);
      if (peers[data.from]) {
        console.log(`Signaling existing peer for ${data.from}`);
        peers[data.from].peer.signal(data.signal);
      } else {
        console.log(`Creating new peer for ${data.from} due to incoming signal`);
        createPeer(data.from, socketRef.current.id, data.from, true, data.signal);
      }
    });
  };

  const createPeer = (userId, callerId, recipientId, initiator, signalData) => {
    console.log(
      `Creating peer for ${userId}, initiator: ${initiator}, caller: ${callerId}, recipient: ${recipientId}`
    );
    if (!streamRef.current) {
      console.warn("No local stream available to create peer for", userId);
      return;
    }

    const peer = new SimplePeer({
      initiator,
      trickle: true, // Enable trickle ICE
      stream: streamRef.current,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          // Add TURN server if needed
        ],
      },
    });

    console.log("Stream added to peer:", streamRef.current);

    let retryCount = 0;
    const maxRetries = 3;

    if (signalData) {
      console.log("Signaling peer with initial signal:", signalData);
      peer.signal(signalData);
    }

    peer.on("signal", (signal) => {
      console.log(`Sending signal from ${callerId} to ${recipientId}:`, signal);
      socketRef.current.emit("signal", { to: recipientId, signal, from: callerId });
    });

    peer.on("stream", (stream) => {
      console.log(`Received stream from ${userId}`);
      setPeers((prev) => {
        const updatedPeers = { ...prev, [userId]: { peer, stream } };
        console.log("Updated peers:", updatedPeers);
        return updatedPeers;
      });
    });

    peer.on("connect", () => {
      console.log(`Peer connection established with ${userId}`);
    });

    peer.on("error", (err) => {
      console.error("Peer error for", userId, ":", err);
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`Retrying peer connection for ${userId}, attempt ${retryCount}`);
        createPeer(userId, callerId, recipientId, initiator, signalData);
      } else {
        toast.error(`Failed to connect to ${userId}'s stream after ${maxRetries} attempts.`);
      }
    });

    peer.on("close", () => {
      console.log(`Peer connection closed with ${userId}`);
    });

    peersRef.current[userId] = peer;
    setPeers((prev) => {
      const updatedPeers = { ...prev, [userId]: { peer } };
      console.log("Initial peer setup:", updatedPeers);
      return updatedPeers;
    });
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL, { params: { userId } });
      if (Array.isArray(response.data)) {
        setGoals(response.data);
      } else {
        console.error("Expected an array for goals, received:", response.data);
        setGoals([]);
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      setGoals([]);
      toast.error("Failed to fetch goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      if (Array.isArray(response.data)) {
        setAllUsers(response.data);
      } else {
        console.error("Expected an array for users, received:", response.data);
        setAllUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setAllUsers([]);
      toast.error("Failed to fetch users. Please try again.");
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
      toast.error("Failed to create goal. Please try again.");
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
      toast.error("Failed to add member. Please try again.");
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
      toast.error("Failed to add comment. Please try again.");
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
      toast.error("Failed to edit comment. Please try again.");
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
      toast.error("Failed to delete comment. Please try again.");
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

    await requestMediaAccess();
    if (!streamRef.current) {
      toast.error("Cannot start meeting without media access.");
      return;
    }

    const newMeetingId = `meeting_${Date.now()}_${selectedGoal.taskId}`;
    setMeetingId(newMeetingId);
    setIsMeetingActive(true);
    socketRef.current.emit("initiateMeeting", {
      leaderId: userId,
      leaderName: username,
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

    await requestMediaAccess();
    if (!streamRef.current) {
      toast.error("Cannot join meeting without media access.");
      return;
    }

    socketRef.current.emit("joinMeeting", { meetingId, userId, userName: username, goalId: selectedGoal.taskId });
    setIsMeetingActive(true);
    setView("meeting");
    toast.info(`Joined meeting ${meetingId} for goal ${selectedGoal.title}`);
  };

  const leaveMeeting = () => {
    setIsMeetingActive(false);
    setMeetingId("");
    Object.values(peers).forEach(({ peer }) => peer.destroy());
    setPeers({});
    peersRef.current = {};
    setParticipants([]);
    socketRef.current.emit("leaveMeeting", { meetingId, userId });
    stopMediaStream();
    setView("dashboard");
    toast.info("Left the meeting");
  };

  const retryMediaAccess = async () => {
    stopMediaStream();
    await requestMediaAccess();
    if (streamRef.current && participants.length > 0) {
      participants.forEach((participant) => {
        if (participant.userId !== userId && !peers[participant.userId] && participant.socketId) {
          console.log(`Re-initiating peer connection with ${participant.userId} (${participant.socketId})`);
          createPeer(participant.userId, socketRef.current.id, participant.socketId, false);
        }
      });
    }
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
              <div className="video-container" style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                {myStream && !mediaError && (
                  <div className="video-wrapper" key={`${userId}-local-${Date.now()}`}>
                    <Typography variant="body2" style={{ textAlign: "center" }}>
                      {username} (You{isLeader ? ", Leader" : ""})
                    </Typography>
                    <video
                      ref={(video) => {
                        if (video && myStream) {
                          video.srcObject = myStream;
                          video.play().catch((err) => console.error("Local video play error:", err));
                        }
                      }}
                      autoPlay
                      muted
                      style={{ width: "300px", height: "200px", backgroundColor: "black", borderRadius: "8px" }}
                    />
                  </div>
                )}

                {Object.entries(peers).map(([peerUserId, peerData]) => {
                  const participant = participants.find((p) => p.userId === peerUserId);
                  if (!participant) {
                    console.log(`Participant not found for peerUserId: ${peerUserId}`);
                    return null;
                  }

                  console.log(`Rendering stream for ${peerUserId}:`, peerData);
                  return (
                    <div key={peerUserId} className="video-wrapper">
                      <Typography variant="body2" style={{ textAlign: "center" }}>
                        {participant.userName} {participant.isLeader ? "(Leader)" : ""}
                      </Typography>
                      {peerData.stream ? (
                        <video
                          ref={(video) => {
                            if (video && peerData.stream) {
                              video.srcObject = peerData.stream;
                              video.play().catch((err) => console.error(`Video play error for ${peerUserId}:`, err));
                            }
                          }}
                          autoPlay
                          style={{ width: "300px", height: "200px", backgroundColor: "black", borderRadius: "8px" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "300px",
                            height: "200px",
                            backgroundColor: "gray",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "8px",
                          }}
                        >
                          <Typography variant="body2">Waiting for stream...</Typography>
                        </div>
                      )}
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