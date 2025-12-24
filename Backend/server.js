require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { connectToDatabase } = require("./db");

// Routes
const authenticationRoutes = require("./authentication");
const personalGoalRoutes = require("./personalGoal");
const notesRoutes = require("./notes");
const calendarRoutes = require("./calendar");
const savedVideosRoutes = require("./SavedVideos");
const teamGoalRoutes = require("./teamGoal");
const profileRouter = require("./profile");

const app = express();
const port = process.env.PORT || 3000;

/* --------------------------------------------------
   BASIC MIDDLEWARE
-------------------------------------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* --------------------------------------------------
   DEBUG REQUEST ORIGIN
-------------------------------------------------- */
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.path} | Origin: ${req.headers.origin}`);
  next();
});

/* --------------------------------------------------
   CORS CONFIG (ONLY PLACE WHERE CORS IS HANDLED)
-------------------------------------------------- */
const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "http://localhost:5176",
  "http://localhost:5178",
  "http://localhost:4200",
  "https://focusfuze.netlify.app",
  "https://focus-fuze-1.onrender.com"
];


app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        // Return the specific origin (not *) when credentials are used
        return callback(null, origin);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Type"],
  })
);

/* --------------------------------------------------
   TRUST PROXY (REQUIRED FOR RENDER)
-------------------------------------------------- */
app.set("trust proxy", 1);

/* --------------------------------------------------
   SESSION CONFIG
-------------------------------------------------- */
app.use(
  session({
    name: "focusfuze.sid",
    secret: process.env.SESSION_SECRET || "dev_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* --------------------------------------------------
   ROUTES
-------------------------------------------------- */
app.use("/auth", authenticationRoutes);
app.use("/personal-goals", personalGoalRoutes);
app.use("/notes", notesRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api/videos", savedVideosRoutes);
app.use("/team-goals", teamGoalRoutes);
app.use("/api/profile", profileRouter);

/* --------------------------------------------------
   STATIC FILES
-------------------------------------------------- */
app.use("/uploads", express.static("uploads"));

/* --------------------------------------------------
   HEALTH CHECK
-------------------------------------------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is healthy" });
});

/* --------------------------------------------------
   ROOT
-------------------------------------------------- */
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Focus Fuze API running" });
});

/* --------------------------------------------------
   404 HANDLER
-------------------------------------------------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* --------------------------------------------------
   ERROR HANDLER
-------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

/* --------------------------------------------------
   START SERVER
-------------------------------------------------- */
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`✅ Server running on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
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