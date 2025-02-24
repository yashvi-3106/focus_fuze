require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { connectToDatabase } = require('./db');  // Import database connection

const authenticationRoutes = require('./authentication');
const personalGoalRoutes = require('./personalGoal');
const notesRoutes = require("./notes");
const calendarRoutes = require("./calendar");
const savedVideosRoutes = require("./SavedVideos");


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5179', 
  'http://localhost:3000', 
  'https://focus-fuze.netlify.app', 
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and session to be sent with requests
};


// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // 'true' for production, 'false' for local
    httpOnly: true,
    sameSite: 'strict',  // Helps avoid CORS-related issues with cookies
    maxAge: 1000 * 60 * 60 * 24, // 1 day expiration
  },
}));

app._router.stack.forEach(function (r) {
  if (r.route && r.route.path) {
    console.log(r.route.path);
  }
});


// Register Routes
app.use('/auth', authenticationRoutes);

app.use('/personal-goals', personalGoalRoutes);

app.use("/notes", notesRoutes);
app.use("/calendar", calendarRoutes);
app.use("/api/videos", savedVideosRoutes);

app.get("/", (req, res) => {
  res.send("Notes API is running...");
});

const startServer = async () => {
  try {
      await connectToDatabase();
      app.listen(port, () => {
          console.log(`Server running at http://localhost:${port}`);
      });
  } catch (err) {
      console.error("Database connection failed:", err);
      process.exit(1);
  }
};

startServer();
