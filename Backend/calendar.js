const express = require('express');
const router = express.Router();
const { getDb } = require('./db');

const isValidDate = (date) => {
  const regex = /^\d{4}-\d{2}-\d{2}$/; 
  if (!regex.test(date)) return false;

  const parsedDate = new Date(date);
  return !isNaN(parsedDate);
};


router.get('/range', async (req, res) => {
  const { start, end } = req.query;

  if (!isValidDate(start) || !isValidDate(end)) {
    return res.status(400).send("Invalid date format. Please use YYYY-MM-DD.");
  }

  try {
    const db = getDb();
    const goals = db.collection("goals");
    const teamGoals = db.collection("teamGoals");

    // Find all personal goals and team goals within the date range
    const personalTasks = await goals.find({
      dueDate: { $gte: start, $lte: end },
    }).toArray();

    const teamTasks = await teamGoals.find({
      dueDate: { $gte: start, $lte: end },
    }).toArray();

    // Extract unique due dates
    const taskDates = new Set([
      ...personalTasks.map(task => task.dueDate),
      ...teamTasks.map(task => task.dueDate),
    ]);

    res.status(200).json({ dates: [...taskDates] });
  } catch (err) {
    console.error("Error fetching task dates:", err);
    res.status(500).send("Error fetching task dates.");
  }
});






router.get('/:date', async (req, res) => {
  const { date } = req.params;

  if (!isValidDate(date)) {
    return res.status(400).send('Invalid date format. Please use YYYY-MM-DD.');
  }

  const startOfDay = new Date(date);
  const endOfDay = new Date(date);
  endOfDay.setDate(endOfDay.getDate() + 1);

  try {
    const db = getDb();
    const goals = db.collection('goals');
    const teamGoals = db.collection('teamGoals');

    
    const personalTasks = await goals.find({
      $or: [
        { dueDate: { $gte: startOfDay, $lt: endOfDay } },
        { completedAt: { $gte: startOfDay, $lt: endOfDay } },
      ],
    }).toArray();

    
    const teamTasks = await teamGoals.find({
      $or: [
        { dueDate: { $gte: startOfDay, $lt: endOfDay } },
        { "members.completedAt": { $gte: startOfDay, $lt: endOfDay } },
      ],
    }).toArray();

    const tasksForDay = [];

  
    personalTasks.forEach((task) => {
      tasksForDay.push({
        title: task.title,
        type: 'Personal',
        dueDate: task.dueDate,
        completedAt: task.completedAt,
        status: task.status,
        rewardPoints: task.rewardPoints,
      });
    });

    
    teamTasks.forEach((task) => {
      task.members.forEach((member) => {
        if (
          (member.completedAt >= startOfDay && member.completedAt < endOfDay) ||
          (task.dueDate >= startOfDay && task.dueDate < endOfDay)
        ) {
          tasksForDay.push({
            title: task.title,
            type: 'Team',
            dueDate: task.dueDate,
            completedAt: member.completedAt,
            status: member.completed ? 'Completed' : 'Pending',
            rewardPoints: task.rewardPoints,
          });
        }
      });
    });

    res.status(200).json({
      date: startOfDay.toISOString().split('T')[0], 
      tasks: tasksForDay,
    });
  } catch (err) {
    console.error('Error fetching tasks for calendar date:', err);
    res.status(500).send('Error fetching tasks for calendar date');
  }
});

module.exports = router;