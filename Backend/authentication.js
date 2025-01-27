const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./db');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { fullname, username, password, confirmPassword } = req.body;

 
  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();

  if (trimmedPassword !== trimmedConfirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

 
  const hashedPassword = await bcrypt.hash(trimmedPassword, 10);

  try {
    const db = getDb();
    const users = db.collection('users');

   
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(400).send('Username already exists');
    }

    
    await users.insertOne({
      fullname,
      username,
      password: hashedPassword,
    });

    console.log('User registered with hashed password:', hashedPassword);

    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).send('Error registering user');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

 
  const trimmedPassword = password.trim();

  try {
    const db = getDb();
    const users = db.collection('users');


    const user = await users.findOne({ username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    console.log('Input Password:', trimmedPassword);
    console.log('Stored Hashed Password:', user.password);

   
    const isMatch = await bcrypt.compare(trimmedPassword, user.password);
    console.log('Password Match Result:', isMatch);

    if (!isMatch) {
      return res.status(400).send('Invalid password');
    }

   
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret_key', {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).send('Error during login');
  }
});

module.exports = router;

