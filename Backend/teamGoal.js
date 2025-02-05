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


router.post("/tasks/join", async (req, res) => {
  const { userId, taskId, name } = req.body;

  if (!userId || !taskId || !name) {
    return res.status(400).send("User ID, Task ID, and Name are required");
  }

  try {
    const db = getDb();
    const teamGoals = db.collection("teamGoals");

    const task = await teamGoals.findOne({ taskId });
    if (!task) {
      return res.status(404).send("Task not found");
    }

    await teamGoals.updateOne(
      { taskId },
      { $push: { members: { memberId: userId, name, completed: false } } }
    );

    res.status(200).send("User successfully joined the task");
  } catch (err) {
    console.error("Error joining task:", err);
    res.status(500).send("Error joining task");
  }
});



// POST: Mark a member's task as completed
// POST: Mark a member's task as completed
router.post('/complete-task/:taskId/:memberId', async (req, res) => {
  const { taskId, memberId } = req.params;

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    // Find the task by taskId
    const task = await teamGoals.findOne({ taskId });
    if (!task) return res.status(404).send('Task not found');

    // Find the member by memberId in the task's members array
    const member = task.members.find((m) => m.memberId === memberId);
    if (!member) return res.status(404).send('Member not found in this task');

    // Update the member's 'completed' status to true
    await teamGoals.updateOne(
      { taskId, 'members.memberId': memberId },
      { $set: { 'members.$.completed': true } } // Mark the task as complete for the specific member
    );

    res.status(200).json({ message: 'Task marked as completed for member' });
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


router.post('/add-comment/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { user, text } = req.body;

  if (!user || !text) {
    return res.status(400).send("User and text are required to post a comment");
  }

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    // Find the task by taskId
    const task = await teamGoals.findOne({ taskId });
    if (!task) return res.status(404).send('Task not found');

    // Add the new comment to the task's comments array
    await teamGoals.updateOne(
      { taskId },
      { $push: { comments: { user, text, createdAt: new Date() } } }
    );

    res.status(200).json({ message: 'Comment added successfully' });
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).send('Error adding comment');
  }
});

// POST: Delete a comment from a task
router.post('/delete-comment/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { user, text } = req.body;

  if (!user || !text) {
    return res.status(400).send("User and text are required to delete a comment");
  }

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    // Find the task by taskId
    const task = await teamGoals.findOne({ taskId });
    if (!task) return res.status(404).send('Task not found');

    // Find the comment by user and text
    const comment = task.comments.find(
      (comment) => comment.user === user && comment.text === text
    );

    if (!comment) return res.status(404).send('Comment not found');

    // Remove the comment from the task's comments array
    await teamGoals.updateOne(
      { taskId },
      { $pull: { comments: { user, text } } }
    );

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).send('Error deleting comment');
  }
});


// // Route to get task details by taskId
// router.get("/team-goals/:taskId", authenticateUser, async (req, res) => {
//   const { taskId } = req.params;

//   try {
//     const db = getDb();
//     const teamGoals = db.collection("teamGoals");

//     // Fetch the task by taskId
//     const task = await teamGoals.findOne({ _id: new ObjectId(taskId) });

//     if (!task) {
//       return res.status(404).send("Task not found.");
//     }

//     res.status(200).json(task); // Send the task details back
//   } catch (err) {
//     console.error("Error fetching task details:", err);
//     res.status(500).send("An error occurred while fetching task details.");
//   }
// });












module.exports = router;