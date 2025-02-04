const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('./db');

const router = express.Router();

// JWT secret
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION || '1h';

// Sign In (Register) Route
router.post('/register', async (req, res) => {
  const { fullname, username, password, confirmPassword } = req.body;

  // Validate passwords
  if (password !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    const db = getDb();
    const users = db.collection('users');

    // Check if the username already exists
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    // Add the user to the database
    await users.insertOne({
      fullname,
      username,
      password, // Storing password as plain text (not recommended for production)
    });

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).send('An error occurred during registration');
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const db = getDb();
    const users = db.collection('users');

    // Check if the username exists
    const user = await users.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    // Verify the password
    if (user.password !== password) {
      return res.status(400).send('Invalid password');
    }

    // Generate a JWT token with userId in the payload
    const token = jwt.sign({ userId: user._id }, jwtSecret, {
      expiresIn: jwtExpiration,
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('An error occurred during login');
  }
});

module.exports = router; 