require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { connectToDatabase } = require('./db');

const authenticationRoutes = require('./authentication');
const personalGoalRoutes = require('./personalGoal');
const notesRoutes = require("./notes");
const calendarRoutes = require("./calendar");
const savedVideosRoutes = require("./SavedVideos");
const teamGoalRoutes = require("./teamGoal");

const app = express();
const port = process.env.PORT || 3000;

// app.use(express.json());
app.use(express.json({ limit: "50mb" })); // Increase limit as needed
app.use(express.urlencoded({ extended: true, limit: "50mb" }));


// ✅ Debugging: Log incoming request origins
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});



// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:5178",
  "http://localhost:5173", // Local frontend
  "https://focuss-fuze.netlify.app" // Deployed frontend
];

// ✅ CORS Configuration
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

// ✅ Handle preflight requests (important for CORS)
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

// ✅ Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    httpOnly: true,
    sameSite: 'Lax', // Important for cross-origin requests (Netlify)
    maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
  },
}));



// ✅ Register Routes
app.use('/auth', authenticationRoutes);
app.use('/personal-goals', personalGoalRoutes);
app.use("/notes", notesRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api/videos", savedVideosRoutes);
app.use("/team-goals", teamGoalRoutes); // Mount team goal routes correctly

// ✅ Root Route
app.get("/", (req, res) => {
  res.send("Notes API is running...");
});

// ✅ Start Server
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
