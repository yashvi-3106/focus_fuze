const express = require("express");
const { getDb } = require("./db");
const { ObjectId } = require("mongodb");

const router = express.Router();

// ✅ Get Dashboard Data
// In your dashboard.js (backend)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("Fetching dashboard data for userId:", userId);  // Log to check the correct userId

  try {
    const db = getDb();
    const tasksCollection = db.collection("goals");
    const notesCollection = db.collection("notes");

    // Ensure the userId is correctly formatted as ObjectId
    const userObjectId = new ObjectId(userId);

    // Fetch pending tasks and completed tasks count
    const pendingTasks = await tasksCollection.countDocuments({ userId: userObjectId, status: { $ne: "Completed" } });
    const completedTasks = await tasksCollection.countDocuments({ userId: userObjectId, status: "Completed" });

    // Fetch recent notes (limit to 5)
    const recentNotes = await notesCollection.find({ userId: userObjectId })
                                              .sort({ createdAt: -1 })
                                              .limit(5)
                                              .project({ title: 1, createdAt: 1 })
                                              .toArray();

    // Prepare the response
    const response = {
      pendingTasks,
      completedTasks,
      recentNotes,
    };

    console.log("Dashboard Data Sent:", response);  // Debugging the response

    // Send the response back to the frontend
    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});
