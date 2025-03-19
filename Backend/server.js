require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { connectToDatabase } = require("./db");
const http = require("http");
const { Server } = require("socket.io");

const authenticationRoutes = require("./authentication");
const personalGoalRoutes = require("./personalGoal");
const notesRoutes = require("./notes");
const calendarRoutes = require("./calendar");
const savedVideosRoutes = require("./SavedVideos");
const teamGoalRoutes = require("./teamGoal");
const profileRouter = require("./profile");

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5178",
      "http://localhost:5173",
      "http://localhost:5176",
      "https://focuss-fuze.netlify.app",
      "https://focus-fuze.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  path: "/socket.io",
  transports: ["websocket", "polling"], // Ensure both transports are allowed
  pingTimeout: 60000, // Increase timeout to handle slow connections
  pingInterval: 25000,
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

const allowedOrigins = [
  "http://localhost:5178",
  "http://localhost:5173",
  "http://localhost:5176",
  "https://focuss-fuze.netlify.app",
  "https://focus-fuze.onrender.com",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "default_secret",
  resave: false,
  saveUninitialized: false, // Set to false to avoid creating sessions for unauthenticated users
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "Lax",
    maxAge: 1000 * 60 * 60 * 24,
  },
});

app.use(sessionMiddleware);

app.use("/auth", authenticationRoutes);
app.use("/personal-goals", personalGoalRoutes);
app.use("/notes", notesRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api/videos", savedVideosRoutes);
app.use("/team-goals", teamGoalRoutes);
app.use("/api/profile", profileRouter);
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("Team Goal API is running...");
});

app.use((req, res, next) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).send(`Cannot ${req.method} ${req.path}`);
});

const onlineUsers = new Map();
const meetingParticipants = new Map();

// Simplify Socket.IO session handling
io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, (err) => {
    if (err) {
      console.error("Session middleware error:", err);
      return next(err);
    }
    if (!socket.request.session || !socket.request.session.userId) {
      console.log("No session or userId found for socket:", socket.id);
      return next(new Error("Authentication required"));
    }
    socket.userId = socket.request.session.userId;
    next();
  });
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  socket.on("authenticate", (data) => {
    const { userId, userName } = data;
    if (socket.userId === userId) {
      onlineUsers.set(userId, { socketId: socket.id, name: userName });
      io.emit("updateUserList", Array.from(onlineUsers.entries()).map(([id, data]) => ({ id, name: data.name })));
      console.log("User authenticated:", userId, "Online users:", onlineUsers.size);
    } else {
      console.log("Authentication mismatch for socket:", socket.id);
      socket.disconnect(true);
    }
  });

  socket.on("initiateMeeting", (data) => {
    const { leaderId, meetingId, goalId, leaderName } = data;
    if (socket.userId === leaderId) {
      socket.join(meetingId);
      socket.isLeader = true;
      socket.meetingId = meetingId;
      if (!meetingParticipants.has(meetingId)) {
        meetingParticipants.set(meetingId, new Map());
      }
      const participants = meetingParticipants.get(meetingId);
      participants.set(leaderId, { userId: leaderId, userName: leaderName, isLeader: true, socketId: socket.id });
      io.to(meetingId).emit("updateParticipants", Array.from(participants.values()));
      io.emit("meetingStarted", { meetingId, leaderId, leaderName, goalId });
      console.log(`Meeting ${meetingId} initiated by ${leaderName} (${leaderId}) for goal ${goalId}`);
    }
  });

  socket.on("joinMeeting", ({ meetingId, userId, userName, goalId }) => {
    const user = onlineUsers.get(userId);
    if (user && socket.userId === userId) {
      socket.join(meetingId);
      socket.meetingId = meetingId;
      if (!meetingParticipants.has(meetingId)) {
        meetingParticipants.set(meetingId, new Map());
      }
      const participants = meetingParticipants.get(meetingId);
      participants.set(userId, { userId, userName, isLeader: false, socketId: socket.id });

      socket.to(meetingId).emit("userJoinedMeeting", {
        userId,
        userName,
        socketId: socket.id,
        goalId,
      });

      io.to(meetingId).emit("updateParticipants", Array.from(participants.values()));
      console.log(`${userId} (${userName}) joined meeting ${meetingId} for goal ${goalId}`);
    } else {
      socket.emit("joinMeetingError", "User not authenticated");
    }
  });

  socket.on("signal", (data) => {
    const { to, signal, from } = data;
    const toSocket = io.sockets.sockets.get(to);
    if (toSocket) {
      toSocket.emit("signal", { from, signal });
      console.log(`Signal sent from ${from} to ${to}`);
    } else {
      console.log(`Failed to send signal to ${to}: Socket not found`);
    }
  });

  socket.on("leaveMeeting", ({ meetingId, userId }) => {
    if (meetingParticipants.has(meetingId)) {
      const participants = meetingParticipants.get(meetingId);
      participants.delete(userId);
      if (participants.size === 0) {
        meetingParticipants.delete(meetingId);
      } else {
        socket.to(meetingId).emit("userDisconnected", { userId });
        io.to(meetingId).emit("updateParticipants", Array.from(participants.values()));
      }
      console.log(`${userId} left meeting ${meetingId}`);
    }
  });

  socket.on("disconnect", () => {
    for (let [id, data] of onlineUsers.entries()) {
      if (data.socketId === socket.id) {
        onlineUsers.delete(id);
        io.emit("updateUserList", Array.from(onlineUsers.entries()).map(([id, data]) => ({ id, name: data.name })));
        io.emit("userDisconnected", { userId: id });

        for (let [meetingId, participants] of meetingParticipants.entries()) {
          if (participants.has(id)) {
            participants.delete(id);
            if (participants.size === 0) {
              meetingParticipants.delete(meetingId);
            } else {
              io.to(meetingId).emit("userDisconnected", { userId: id });
              io.to(meetingId).emit("updateParticipants", Array.from(participants.values()));
            }
          }
        }
        console.log("User disconnected:", id, "Online users:", onlineUsers.size);
        break;
      }
    }
  });
});

const startServer = async () => {
  try {
    await connectToDatabase();
    server.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port} with WebSockets`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

startServer();