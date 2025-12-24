require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { connectToDatabase } = require('./db');

// Import routes
const authenticationRoutes = require('./authentication');
const personalGoalRoutes = require('./personalGoal');
const notesRoutes = require("./notes");
const calendarRoutes = require("./calendar");
const savedVideosRoutes = require("./SavedVideos");
const teamGoalRoutes = require("./teamGoal");
const profileRouter = require("./profile");

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:5178",
  "http://localhost:5173",
  "https://focusfuze.netlify.app",
  "http://localhost:5176",
  "https://focus-fuze.onrender.com"
];

// Enable CORS pre-flight
app.options('*', cors());

// CORS middleware
// CORS middleware - place this right after your CORS configuration
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Body parser middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Debugging: Log incoming requests
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// Register Routes
app.use('/auth', authenticationRoutes);
app.use('/personal-goals', personalGoalRoutes);
app.use("/notes", notesRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api/videos", savedVideosRoutes);
app.use("/team-goals", teamGoalRoutes);
app.use("/api/profile", profileRouter);

// Static files
app.use("/uploads", express.static("uploads"));

// Root Route
app.get("/", (req, res) => {
  res.json({ status: 'ok', message: 'Focus Fuze API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
});

const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
      console.log(`✅ Allowed Origins:`, allowedOrigins);
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
};

startServer();


// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');
// const session = require('express-session');
// const { connectToDatabase } = require('./db');

// const authenticationRoutes = require('./authentication');
// const personalGoalRoutes = require('./personalGoal');
// const notesRoutes = require("./notes");
// const calendarRoutes = require("./calendar");
// const savedVideosRoutes = require("./SavedVideos");
// const teamGoalRoutes = require("./teamGoal");
// const profileRouter = require("./profile");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// // Debugging: Log incoming requests
// app.use((req, res, next) => {
//   console.log(`[${req.method}] ${req.path} - Origin: ${req.headers.origin}`);
//   next();
// });

// // CORS configuration
// const allowedOrigins = [
//   "http://localhost:4200", // Fixed: Removed leading space
//   "http://localhost:5178",
//   "http://localhost:5173",
//   "https://focuss-fuze.netlify.app",
//   "http://localhost:5176"
// ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       console.log("❌ Blocked by CORS:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true, // Allow cookies/credentials
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };

// app.use(cors(corsOptions)); // Use cors middleware only

// app.use(session({
//   secret: process.env.SESSION_SECRET || 'default_secret',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: process.env.NODE_ENV === 'production', // False in dev
//     httpOnly: true,
//     sameSite: 'Lax',
//     maxAge: 1000 * 60 * 60 * 24, // 1 day
//   },
// }));

// // Register Routes
// app.use('/auth', authenticationRoutes);
// app.use('/personal-goals', personalGoalRoutes);
// app.use("/notes", notesRoutes);
// app.use("/calendar", calendarRoutes);
// app.use("/api/videos", savedVideosRoutes);
// app.use("/team-goals", teamGoalRoutes);
// app.use("/api/profile", profileRouter);

// app.use("/uploads", express.static("uploads"));

// // Root Route
// app.get("/", (req, res) => {
//   res.send("Notes API is running...");
// });

// // Catch-all for unmatched routes
// app.use((req, res, next) => {
//   console.log(`❌ 404 - Route not found: ${req.method} ${req.path}`);
//   res.status(404).send(`Cannot ${req.method} ${req.path}`);
// });

// const startServer = async () => {
//   try {
//     await connectToDatabase();
//     app.listen(port, () => {
//       console.log(`✅ Server running at http://localhost:${port}`);
//     });
//   } catch (err) {
//     console.error("❌ Database connection failed:", err);
//     process.exit(1);
//   }
// };

// startServer();