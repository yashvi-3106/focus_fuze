const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db');

const router = express.Router();

// POST: Create a new team goal
router.post('/', async (req, res) => {
  const { title, description, dueDate, priority, members, leaderId } = req.body;

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


router.post('/tasks/join', async (req, res) => {
  const { userId, taskId } = req.body;

  if (!userId || !taskId) {
    return res.status(400).send('User ID and Task ID are required');
  }

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

   
    const task = await teamGoals.findOne({ taskId });
    if (!task) {
      return res.status(404).send('Task not found');
    }

    
    const isMember = task.members.some((member) => member.memberId === userId);
    if (isMember) {
      return res.status(400).send('User already joined this task');
    }

    
    await teamGoals.updateOne(
      { taskId },
      { $push: { members: { memberId: userId, name: 'New Member', completed: false } } }
    );

    res.status(200).send('User successfully joined the task');
  } catch (err) {
    console.error('Error joining task:', err);
    res.status(500).send('Error joining task');
  }
});

// POST: Mark a member's task as completed
router.post('/complete-task/:taskId/:memberId', async (req, res) => {
  const { taskId, memberId } = req.params;

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    const task = await teamGoals.findOne({ taskId });
    if (!task) return res.status(404).send('Task not found');

    const member = task.members.find((m) => m.memberId === memberId);
    if (!member) return res.status(404).send('Member not found in this task');

    await teamGoals.updateOne(
      { taskId, 'members.memberId': memberId },
      { $set: { 'members.$.completed': true } }
    );

    res.status(200).json({ message: 'Task marked as completed' });
  } catch (err) {
    console.error('Error marking task as completed:', err);
    res.status(500).send('Error marking task as completed');
  }
});

// GET: Fetch task dashboard
router.get('/task-dashboard/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    const task = await teamGoals.findOne({ taskId });
    if (!task) return res.status(404).send('Task not found');

    res.status(200).json(task);
  } catch (err) {
    console.error('Error fetching task dashboard:', err);
    res.status(500).send('Error fetching task dashboard');
  }
});

module.exports = router;
