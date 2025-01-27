const express = require('express');
const { getDb } = require('./db');

const router = express.Router();

const authenticateUser = (req, res, next) => {
  const userId = req.body.userId;
  if (!userId) {
    return res.status(401).send('Unauthorized: Please provide userId');
  }
  req.userId = userId;
  next();
};

router.get('/', authenticateUser, async (req, res) => {
  const userId = req.userId;

  try {
    const db = getDb();
    const goals = db.collection('goals');
    const teamGoals = db.collection('teamGoals');

   // personal goal
    const personalTasks = await goals.find({ userId: userId }).toArray();
    const completedPersonalTasks = personalTasks.filter(task => task.status === 'completed');
    const pendingPersonalTasks = personalTasks.filter(task => task.status === 'pending');

    // Fetch team tasks
    const teamTasks = await teamGoals.find({ "members.memberId": userId }).toArray();
    const completedTeamTasks = teamTasks.filter(task =>
      task.members.some(member => member.memberId === userId && member.completed)
    );
    const pendingTeamTasks = teamTasks.filter(task =>
      task.members.some(member => member.memberId === userId && !member.completed)
    );

    // Calculate metrics
    const totalTasks = personalTasks.length + teamTasks.length;
    const completedTasks = completedPersonalTasks.length + completedTeamTasks.length;
    const pendingTasks = pendingPersonalTasks.length + pendingTeamTasks.length;
    const totalRewardPoints = completedPersonalTasks.reduce((acc, task) => acc + task.rewardPoints, 0);

    // Prepare recent activity
    const recentActivity = [
      ...completedPersonalTasks.map(task => ({
        title: task.title,
        date: task.completedAt,
        rewardPoints: task.rewardPoints,
        type: 'Personal',
      })),
      ...completedTeamTasks.map(task => ({
        title: task.title,
        date: task.completedAt,
        rewardPoints: task.rewardPoints,
        type: 'Team',
      })),
    ];

    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivityLimit = recentActivity.slice(0, 5);

    res.status(200).json({
      totalTasks,
      completedTasks,
      pendingTasks,
      totalRewardPoints,
      recentActivity: recentActivityLimit,
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).send('Error fetching dashboard data');
  }
});

module.exports = router;
