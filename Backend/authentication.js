const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");
const { google } = require("googleapis");
const router = express.Router();

// Define User Schema with googleTokens field
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loggedIn: { type: Boolean, default: false },
  googleTokens: { type: Object } // Store Google OAuth tokens
});

const User = mongoose.model("User", userSchema);

// Google OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback"
);

// Register User
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });
    await user.save();
    req.session.userId = user._id;
    res.status(201).json({ message: 'User created successfully', userId: user._id, username: user.username });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login User & Mark as Logged In
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    req.session.userId = user._id;
    console.log("Session after login:", req.session); // Debug session
    console.log("Session ID:", req.sessionID); // Debug session ID
    await User.updateOne({ _id: user._id }, { $set: { loggedIn: true } });
    res.status(200).json({ message: 'Login successful', username: user.username, userId: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fetch Only Logged-In Users
router.get('/logged-in-users', async (req, res) => {
  try {
    const users = await User.find({ loggedIn: true }, 'username _id');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching logged-in users' });
  }
});

// Logout User & Mark as Logged Out
router.post('/logout', async (req, res) => {
  try {
    if (req.session.userId) {
      await User.updateOne({ _id: req.session.userId }, { $set: { loggedIn: false } });
    }
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error logging out' });
  }
});

// Google OAuth2 Routes
router.get('/google', (req, res) => {
  if (!req.session.userId) {
    console.log("No session userId, redirecting to login");
    return res.status(401).json({ error: "Please log in first" });
  }
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state: req.session.userId
  });
  console.log("Redirecting to Google auth URL:", authUrl); // Debug
  res.redirect(authUrl);
});

router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  const userId = req.query.state;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("Tokens received:", tokens);
    await User.updateOne({ _id: userId }, { $set: { googleTokens: tokens } });
    req.session.googleTokens = tokens;
    res.redirect("http://localhost:5173/calendar"); // Matches frontend route
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    res.status(500).send("Google authentication failed");
  }
});

module.exports = router;