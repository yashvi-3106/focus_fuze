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

// Fetch a Single Goal by taskId
router.get("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    console.log(`Fetching goal with taskId: ${taskId}`); // Debug log
    const goal = await TeamGoal.findOne({ taskId });
    if (!goal) {
      const allGoals = await TeamGoal.find({}, "taskId");
      console.log(`Goal with taskId ${taskId} not found. Current goals in database:`, allGoals.map(g => g.taskId));
      return res.status(404).json({ error: "Goal not found" });
    }
    res.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    res.status(500).json({ error: "Error fetching goal" });
  }
});

// Add Members to a Goal (Leader Only)
router.put("/:taskId/members", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { members } = req.body;
    console.log(`Attempting to add members to goal with taskId: ${taskId}`, members);
    const goal = await TeamGoal.findOne({ taskId });
    if (!goal) {
      const allGoals = await TeamGoal.find({}, "taskId");
      console.log(`Goal with taskId ${taskId} not found. Current goals in database:`, allGoals.map(g => g.taskId));
      return res.status(404).json({ error: "Goal not found" });
    }
    goal.members.push(...members.map(m => ({ ...m, username: m.username || "Unknown" })));
    await goal.save();
    console.log(`Members added to goal with taskId ${taskId}`);
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

// Delete a Goal (Leader Only - Deletes Entire Goal)
router.delete("/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.query; // Get userId from query params
    console.log(`Attempting to delete goal with taskId: ${taskId} for userId: ${userId}`);
    const goal = await TeamGoal.findOne({ taskId });
    if (!goal) {
      const allGoals = await TeamGoal.find({}, "taskId");
      console.log(`Goal with taskId ${taskId} not found. Current goals in database:`, allGoals.map(g => g.taskId));
      return res.status(404).json({ error: "Goal not found" });
    }

    // Check if the user is the leader
    if (goal.leaderId !== userId) {
      return res.status(403).json({ error: "Only the leader can delete the entire goal" });
    }

    await TeamGoal.deleteOne({ taskId });
    console.log(`Goal with taskId ${taskId} deleted successfully`);
    res.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Error deleting goal" });
  }
});

// Remove Member from a Goal (Member Only - Removes Themselves)
router.delete("/:taskId/members/:memberId", async (req, res) => {
  try {
    const { taskId, memberId } = req.params;
    const { userId } = req.query; // Get userId from query params
    console.log(`Attempting to remove member ${memberId} from goal with taskId: ${taskId} for userId: ${userId}`);
    const goal = await TeamGoal.findOne({ taskId });
    if (!goal) {
      const allGoals = await TeamGoal.find({}, "taskId");
      console.log(`Goal with taskId ${taskId} not found. Current goals in database:`, allGoals.map(g => g.taskId));
      return res.status(404).json({ error: "Goal not found" });
    }

    // Check if the user is trying to remove themselves
    if (memberId !== userId) {
      return res.status(403).json({ error: "You can only remove yourself from the goal" });
    }

    // Check if the user is the leader (leaders can't remove themselves this way)
    if (goal.leaderId === userId) {
      return res.status(403).json({ error: "Leaders cannot remove themselves this way. Use the delete goal option instead." });
    }

    // Remove the member from the goal
    goal.members = goal.members.filter(member => member.memberId !== memberId);
    await goal.save();
    console.log(`Member ${memberId} removed from goal with taskId ${taskId}`);
    res.json(goal);
  } catch (error) {
    console.error("Error removing member from goal:", error);
    res.status(500).json({ error: "Error removing member from goal" });
  }
});

// Debug Route: Fetch All Goals (Admin/Debug Use Only)
router.get("/debug/all-goals", async (req, res) => {
  try {
    const goals = await TeamGoal.find({});
    res.json(goals);
  } catch (error) {
    console.error("Error fetching all goals:", error);
    res.status(500).json({ error: "Error fetching all goals" });
  }
});

// Export Router
module.exports = router;