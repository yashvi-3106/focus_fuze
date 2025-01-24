const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 7000;

app.use(express.json());

const uri = "mongodb://127.0.0.1:27017";
const dbName = "focus_fuze"; 

let db, users, teamGoals;

MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    users = db.collection('users');
    teamGoals = db.collection('teamGoals');
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });


app.post('/team-goals', async (req, res) => {
  const { title, description, dueDate, priority, members } = req.body;
  const leaderId = req.body.leaderId;  
  const taskId = new ObjectId(); 

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
    taskId: taskId.toString(),
    createdAt: new Date(),
  };

  try {
    await teamGoals.insertOne(newTeamGoal);
    res.status(201).json({ message: 'Team Goal created successfully', taskId: taskId.toString() });
  } catch (err) {
    console.error('Error creating team goal:', err);
    res.status(500).json({ error: 'Error creating team goal' });
  }
});




app.post('/join-task/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { memberId, memberName, assignedTask } = req.body;

  try {
    const task = await teamGoals.findOne({ taskId });

    if (!task) {
      return res.status(404).send('Task not found');
    }


    const updatedTask = await teamGoals.updateOne(
      { taskId },
      { $push: { members: { memberId, name: memberName, assignedTask, completed: false } } }
    );

    res.status(200).json({ message: 'Joined the task successfully' });
  } catch (err) {
    console.error('Error joining task:', err);
    res.status(500).send('Error joining task');
  }
});



app.post('/complete-task/:taskId/:memberId', async (req, res) => {
  const { taskId, memberId } = req.params;

  try {
    const task = await teamGoals.findOne({ taskId });

    if (!task) {
      return res.status(404).send('Task not found');
    }

    const member = task.members.find((m) => m.memberId === memberId);
    if (!member) {
      return res.status(404).send('Member not found in this task');
    }


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



app.get('/task-dashboard/:taskId', async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await teamGoals.findOne({ taskId });

    if (!task) {
      return res.status(404).send('Task not found');
    }

    res.status(200).json(task);
  } catch (err) {
    console.error('Error fetching task dashboard:', err);
    res.status(500).send('Error fetching task dashboard');
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
