const express = require('express');
const cors = require('cors');
const { connectToDatabase } = require('./db');

const app = express();
const port = 5000; 
const mongoUri = "mongodb://127.0.0.1:27017"; 


app.use(express.json());
app.use(cors());


const authenticationRoutes = require('./authentication');
const calendarRoutes = require('./calendar');
const teamGoalRoutes = require('./teamGoal');
const personalGoalRoutes = require('./personalGoal');
const userDashboardRoutes = require('./userDashboard');


app.use('/auth', authenticationRoutes);
app.use('/calendar', calendarRoutes);
app.use('/team-goals', teamGoalRoutes);
app.use('/personal-goals', personalGoalRoutes);
app.use('/dashboard', userDashboardRoutes);


app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy!');
});


const startServer = async () => {
  try {
    await connectToDatabase(); 
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to connect to database. Server not started:', err);
    process.exit(1);
  }
};

startServer();