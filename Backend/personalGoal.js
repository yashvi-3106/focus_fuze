const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db');

const router = express.Router();

// GET all goals for a specific user
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching goals for userId (as string):", userId);

  try {
    const db = getDb();
    const goalsCollection = db.collection('goals');

    // Convert userId to ObjectId
    const userObjectId = new ObjectId(userId);

    // Fetch only the goals belonging to the logged-in user
    const goals = await goalsCollection.find({ userId: userObjectId }).toArray();
    console.log("Fetched goals:", goals);

    res.status(200).json(goals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});

// POST a new goal
// POST a new goal
router.post("/", async (req, res) => {
  const { userId, title, description, deadline, priority, rewardPoints, status } = req.body;
  
  if (!userId || !title || !description || !deadline || !priority || !rewardPoints || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = getDb();
    const goalsCollection = db.collection("goals");

    const newGoal = {
      userId: new ObjectId(userId),
      title,
      description,
      deadline,
      priority,
      rewardPoints,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await goalsCollection.insertOne(newGoal);
    res.status(201).json({ message: "Goal created successfully", goalId: result.insertedId });
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
});


// PATCH (partially update) a goal by ID
router.put("/:goalId", async (req, res) => {
  const { goalId } = req.params;
  const { title, description, deadline, priority } = req.body;

  // Validate the required fields
  if (!title || !description || !deadline || !priority) {
    return res.status(400).json({ error: "Title, description, deadline, and priority are required" });
  }

  try {
    const db = getDb();
    const goalsCollection = db.collection("goals");

    // Update the goal in the database
    const result = await goalsCollection.updateOne(
      { _id: new ObjectId(goalId) },
      { $set: { title, description, deadline, priority, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Goal not found or not updated" });
    }

    res.status(200).json({ message: "Goal updated successfully" });
  } catch (err) {
    console.error("Error updating goal:", err);
    res.status(500).json({ error: "Failed to update goal" });
  }
});


// DELETE a goal by ID
router.delete("/:goalId", async (req, res) => {
    // Fix the variable name here
const { goalId } = req.params;


    try {
        const db = getDb();
        const goalsCollection = db.collection("goals");

        const result = await goalsCollection.deleteOne({ _id: new ObjectId(goalId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "goal not found" });
        }

        res.status(200).json({ message: "goal deleted successfully" });
    } catch (err) {
        console.error("Error deleting goal:", err);
        res.status(500).json({ error: "Failed to delete goal" });
    }
});


// Route to mark a task as complete
router.put("/:goalId/complete", async (req, res) => {
  try {
    const db = getDb();
    const goalsCollection = db.collection("goals");

    const result = await goalsCollection.updateOne(
      { _id: new ObjectId(req.params.goalId) },  // ✅ Convert string to ObjectId
      { $set: { status: "Completed" } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const updatedGoal = await goalsCollection.findOne({ _id: new ObjectId(req.params.goalId) });
    res.json(updatedGoal); // Return the full updated goal
  } catch (error) {
    console.error("Error marking goal as complete:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});


module.exports = router;
