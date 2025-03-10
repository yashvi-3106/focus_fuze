const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// Define User Schema Inline (only if not already defined)
if (!mongoose.models.User) {
  const UserSchema = new mongoose.Schema({
    _id: String, // Assuming userId is stored as a string
    username: String,
    googleTokens: Object, // From your existing Google auth setup
  });
  mongoose.model("User", UserSchema);
}

// Define TeamGoal Schema Inline
const TeamGoalSchema = new mongoose.Schema({
  taskId: { type: String, required: true, unique: true },
  leaderId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
  dueDate: { type: String, required: true },
  members: [{
    memberId: { type: String, required: true },
    username: String,
    task: String,
  }],
  comments: [{
    userId: { type: String, required: true },
    username: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  }],
});

// Create Models
const User = mongoose.models.User; // Use existing model if defined, else the one we just created
const TeamGoal = mongoose.model("TeamGoal", TeamGoalSchema);

// Routes

// Fetch All Users (for member dropdown)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id username");
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Create a Team Goal (Leader)
router.post("/", async (req, res) => {
  try {
    const { leaderId, title, description, priority, dueDate, members } = req.body;
    const taskId = new mongoose.Types.ObjectId().toString(); // Unique taskId
    const goal = new TeamGoal({
      taskId,
      leaderId,
      title,
      description,
      priority,
      dueDate,
      members: members.map(m => ({ ...m, username: m.username || "Unknown" })),
      comments: [],
    });
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ error: "Error creating goal" });
  }
});

// Join a Team Goal (Member)
router.post("/join", async (req, res) => {
  try {
    const { taskId, userId } = req.body;
    const goal = await TeamGoal.findOne({ taskId });
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    if (!goal.members.some(m => m.memberId === userId)) {
      goal.members.push({ memberId: userId, task: "Assigned by Leader", username: "Unknown" });
      await goal.save();
    }
    res.json(goal);
  } catch (error) {
    console.error("Error joining goal:", error);
    res.status(500).json({ error: "Error joining goal" });
  }
});

// Fetch User's Goals (Leader or Member)
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const goals = await TeamGoal.find({
      $or: [{ leaderId: userId }, { "members.memberId": userId }],
    });
    res.json(goals);
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ error: "Error fetching goals" });
  }
});

// Add Members to a Goal (Leader Only)
router.put("/:taskId/members", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { members } = req.body;
    const goal = await TeamGoal.findOne({ taskId });
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    goal.members.push(...members.map(m => ({ ...m, username: m.username || "Unknown" })));
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error adding members:", error);
    res.status(500).json({ error: "Error adding members" });
  }
});

// Add a Comment
router.post("/:taskId/comments", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId, username, content } = req.body;
    const goal = await TeamGoal.findOne({ taskId });
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    goal.comments.push({ userId, username, content, createdAt: new Date() });
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Error adding comment" });
  }
});

// Edit a Comment
router.put("/:taskId/comments/:commentId", async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { content } = req.body;
    const goal = await TeamGoal.findOneAndUpdate(
      { taskId, "comments._id": commentId },
      { $set: { "comments.$.content": content } },
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: "Goal or comment not found" });
    res.json(goal);
  } catch (error) {
    console.error("Error editing comment:", error);
    res.status(500).json({ error: "Error editing comment" });
  }
});

// Delete a Comment
router.delete("/:taskId/comments/:commentId", async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const goal = await TeamGoal.findOneAndUpdate(
      { taskId },
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    res.json(goal);
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Error deleting comment" });
  }
});

// Export Router
module.exports = router;