const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('./db');

const router = express.Router();



// ✅ GET goals for a specific user
router.get("/:userId", async (req, res) => {
  const { userId } = req.params; // Capture the userId from the URL
  console.log("Fetching goals for userId:", userId);  // Log the received userId

  try {
    const db = getDb();
    const goalsCollection = db.collection("goals");

    // Convert userId to ObjectId if it's not already an ObjectId
    const userObjectId = new ObjectId(userId);

    const goals = await goalsCollection.find({ userId: userObjectId }).toArray();
    console.log("Fetched goals:", goals);  // Log the fetched goals
    res.status(200).json(goals);
  } catch (err) {
    console.error("Error fetching goals:", err);
    res.status(500).json({ error: "Failed to fetch goals" });
  }
});


// ✅ POST a new goal
router.post('/', async (req, res) => {
  const { userId, title, description, deadline, priority, rewardPoints } = req.body;

  if (!userId || !title || !description || !deadline || !priority) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = getDb();
    const goalsCollection = db.collection("goals");

    const newGoal = {
      userId,
      title,
      description,
      deadline,
      priority,
      rewardPoints: rewardPoints || 0,
      status: "Not Started",
      createdAt: new Date(),
    };

    const result = await goalsCollection.insertOne(newGoal);
    res.status(201).json({ message: "Goal created successfully", goalId: result.insertedId });
  } catch (err) {
    console.error("Error creating goal:", err);
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// ✅ PUT (update goal: edit, mark as complete, claim reward)
router.put("/:goalId", async (req, res) => {
  const { goalId } = req.params;
  const { title, description, deadline, priority, status, rewardStatus } = req.body;

  if (!title || !description || !deadline || !priority) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const db = getDb();
    const goalsCollection = db.collection("goals");

    const result = await goalsCollection.updateOne(
      { _id: new ObjectId(goalId) },
      { $set: { title, description, deadline, priority, status, rewardStatus, updatedAt: new Date() } }
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

// ✅ DELETE a goal by ID
router.delete("/:goalId", async (req, res) => {
  const { goalId } = req.params;

  try {
    const db = getDb();
    const goalsCollection = db.collection("goals");

    const result = await goalsCollection.deleteOne({ _id: new ObjectId(goalId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Goal not found" });
    }

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("Error deleting goal:", err);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

module.exports = router;
