// authmiddleware.js
const express = require('express');
const { getDb } = require('./db');
const authenticateUser = require('./authMiddleware');  // Import the auth middleware

const router = express.Router();

// POST: Create a new team goal
router.post('/', authenticateUser, async (req, res) => {
  const { title, description, dueDate, priority, members } = req.body;
  const leaderId = req.userId;  // This is extracted from the JWT token by the middleware

  if (!title || !leaderId || !members || members.length === 0) {
    return res.status(400).send('Missing required fields');
  }

  const taskId = new ObjectId().toString();

  const membersWithTasks = members.map((member) => ({
    memberId: member.memberId,
    name: member.name,
    assignedTask: member.assignedTask || 'General task',
    completed: false,
  }));

  const newTeamGoal = {
    title,
    description,
    dueDate,
    priority,
    leaderId,
    members: membersWithTasks,
    taskId,
    createdAt: new Date(),
  };

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');
    await teamGoals.insertOne(newTeamGoal);

    res.status(201).json({
      message: 'Team Goal created successfully',
      taskId,
    });
  } catch (err) {
    console.error('Error creating team goal:', err);
    res.status(500).json({ error: 'Error creating team goal' });
  }
});

module.exports = router;
