const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db'); // Adjust the path if necessary

const router = express.Router();

// 🟢 Create a new task (Unchanged)
// 🟢 Create a new task (leader is the person creating the task)
router.post('/', async (req, res) => {
  const { title, description, dueDate, priority, members, leaderId, leaderName } = req.body;

  if (!title || !leaderId || !leaderName || !members || members.length === 0) {
    return res.status(400).send('Missing required fields');
  }

  const taskId = new ObjectId().toString();

  // Always assign the creator as the leader
  const membersWithRoles = [
    {
      memberId: leaderId,
      name: leaderName,
      assignedTask: "Leader - Manage Task",
      completed: false,
      role: "leader",
    },
    ...members.map(member => ({
      memberId: member.memberId,
      name: member.name,
      assignedTask: member.assignedTask || "General task",
      completed: false,
      role: "member",
    }))
  ];

  const newTeamGoal = {
    title,
    description,
    dueDate,
    priority,
    leaderId,
    members: membersWithRoles,
    taskId, // Ensure taskId is stored as a string
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


// 🟢 Join an existing task (Fixed)
// 🟢 Join an existing task (user is added as a member)
router.post("/tasks/join", async (req, res) => {
  const { userId, taskId, name } = req.body;

  if (!userId || !taskId || !name) {
    return res.status(400).send("User ID, Task ID, and Name are required");
  }

  try {
    const db = getDb();
    const teamGoals = db.collection("teamGoals");

    const task = await teamGoals.findOne({ taskId: taskId });

    if (!task) {
      return res.status(404).send("Task not found");
    }

    // Check if the user is already a member
    const isAlreadyMember = task.members.some(member => member.memberId === userId);
    if (isAlreadyMember) {
      return res.status(400).send("User is already a member of this task");
    }

    // Add user as a member
    await teamGoals.updateOne(
      { taskId: taskId },
      { $push: { members: { memberId: userId, name, assignedTask: "General task", completed: false, role: "member" } } }
    );

    res.status(200).send("User successfully joined the task as a member");
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).send("Error adding member to the task");
  }
});


// 🟢 Fetch task details (Fixed)
router.get('/task-dashboard/:taskId', async (req, res) => {
  const { taskId } = req.params;

  console.log("Received request for taskId:", taskId);  // Debugging log

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    let task = await teamGoals.findOne({ taskId: taskId });  // Searching by taskId (string)

    if (!task) {
      console.log("Task not found for taskId:", taskId);
      return res.status(404).json({ error: 'Task not found' });
    }

    console.log("Task found:", task);
    res.status(200).json({
      task,
      members: task.members || [],
      comments: task.comments || [],
    });
  } catch (err) {
    console.error('Error fetching task details:', err);
    res.status(500).json({ error: 'Error fetching task details' });
  }
});



// 🟢 Mark Task as Complete (Fixed)
router.post('/:taskId/mark-complete', async (req, res) => {
  const { taskId } = req.params;
  const { memberId } = req.body;

  if (!taskId || !memberId) {
    return res.status(400).json({ error: "Task ID and Member ID are required." });
  }

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    const task = await teamGoals.findOne({ taskId: taskId }); // ✅ Fix applied

    if (!task) return res.status(404).json({ error: 'Task not found' });

    const member = task.members.find(m => m.memberId === memberId);
    if (!member) return res.status(404).json({ error: 'Member not found in this task' });

    await teamGoals.updateOne(
      { taskId: taskId, "members.memberId": memberId },
      { $set: { "members.$.completed": true } }
    );

    res.status(200).json({ message: "Task marked as completed" });
  } catch (err) {
    console.error("Error marking task as completed:", err);
    res.status(500).json({ error: "Error marking task as completed" });
  }
});


// 🟢 Fetch tasks for a specific user (Leader or Member)
router.get('/user-tasks/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const db = getDb();
    const teamGoals = db.collection('teamGoals');

    const tasks = await teamGoals.find({
      $or: [
        { 'members.memberId': userId }, // Task where the user is a member
        { 'leaderId': userId }, // Task where the user is the leader
      ]
    }).toArray();

    res.status(200).json(tasks.map(task => ({
      taskId: task.taskId,
      title: task.title,
      role: task.members.find(member => member.memberId === userId)?.role || "leader"
    })));
  } catch (err) {
    console.error("Error fetching tasks for user:", err);
    res.status(500).json({ error: "Error fetching tasks" });
  }
});


module.exports = router; 