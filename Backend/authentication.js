const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");

const router = express.Router();

// ✅ Define User Schema Inside authentication.js
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  loggedIn: { type: Boolean, default: false } // ✅ Track login status
});

const User = mongoose.model("User", userSchema);

// ✅ Register User
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    req.session.userId = user._id; // Set session on successful registration
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Login User & Mark as Logged In
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    req.session.userId = user._id; // Store userId in session

    // ✅ Mark user as logged in
    await User.updateOne({ _id: user._id }, { $set: { loggedIn: true } });

    res.status(200).json({ message: 'Login successful', username: user.username, userId: user._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Fetch Only Logged-In Users
router.get('/logged-in-users', async (req, res) => {
  try {
    const users = await User.find({ loggedIn: true }, 'username _id'); // ✅ Fetch only active users
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching logged-in users' });
  }
});

// ✅ Logout User & Mark as Logged Out
router.post('/logout', async (req, res) => {
  try {
    if (req.session.userId) {
      await User.updateOne({ _id: req.session.userId }, { $set: { loggedIn: false } }); // ✅ Mark as logged out
    }
    
    req.session.destroy(() => {
      res.status(200).json({ message: 'Logged out successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error logging out' });
  }
});

module.exports = router;
