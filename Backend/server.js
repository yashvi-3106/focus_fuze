require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { connectToDatabase } = require('./db');

const authenticationRoutes = require('./authentication');
const personalGoalRoutes = require('./personalGoal');
// console.log("✅ personalGoalRoutes routes:", personalGoalRoutes.stack.map(r => `${r.route.path} (${r.route.stack[0].method})`));
const notesRoutes = require("./notes");
const calendarRoutes = require("./calendar");
const savedVideosRoutes = require("./SavedVideos");
const teamGoalRoutes = require("./teamGoal");
const profileRouter = require("./profile");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Debugging: Log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

const allowedOrigins = [
  "http://localhost:5178",
  "http://localhost:5173",
  "https://focuss-fuze.netlify.app",
  "http://localhost:5176"
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

// Handle preflight requests
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

app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false, // Avoid resaving unchanged sessions
  saveUninitialized: false, // Don’t create a session until something is stored
  cookie: {
    secure: process.env.NODE_ENV === 'production', // false in development
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Register Routes
app.use('/auth', authenticationRoutes);
app.use('/personal-goals', personalGoalRoutes);
app.use("/notes", notesRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api/videos", savedVideosRoutes);
app.use("/team-goals", teamGoalRoutes);
app.use("/api/profile", profileRouter);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static("uploads"));

// Root Route
app.get("/", (req, res) => {
  res.send("Notes API is running...");
});

// Catch-all for unmatched routes (AFTER all specific routes)
app.use((req, res, next) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).send(`Cannot ${req.method} ${req.path}`);
});

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`✅ Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

startServer();