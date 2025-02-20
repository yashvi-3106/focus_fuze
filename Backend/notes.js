const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("./db"); // Ensure you have a `getDb` function to connect to MongoDB

const router = express.Router();

// Create a new note

// Fetch notes based on userId
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("Fetching notes for userId (as string):", userId);
  
    try {
      const db = getDb();
      const notesCollection = db.collection("notes");
  
      // Convert userId to ObjectId if it's not already an ObjectId
      const userObjectId = new ObjectId(userId);
  
      // Fetch only the notes belonging to the logged-in user
      const notes = await notesCollection.find({ userId: userObjectId }).toArray();
      console.log("Fetched notes:", notes); // Debugging
  
      res.status(200).json(notes);
    } catch (err) {
      console.error("Error fetching notes:", err);
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });
  
  // Create note
  router.post("/", async (req, res) => {
    const { userId, title, content } = req.body;
    if (!userId || !title || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      const db = getDb();
      const notesCollection = db.collection("notes");
  
      const newNote = {
        userId: new ObjectId(userId), // Ensure ObjectId format
        title,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      const result = await notesCollection.insertOne(newNote);
      res.status(201).json({ message: "Note created successfully", noteId: result.insertedId });
    } catch (err) {
      console.error("Error creating note:", err);
      res.status(500).json({ error: "Failed to create note" });
    }
  });
  

// Edit a note
router.put("/:noteId", async (req, res) => {
    const { noteId } = req.params;
    const { title, content } = req.body;

    if (!title || !content) {
        return res.status(400).json({ error: "Title and content are required" });
    }

    try {
        const db = getDb();
        const notesCollection = db.collection("notes");

        const result = await notesCollection.updateOne(
            { _id: new ObjectId(noteId) },
            { $set: { title, content, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Note not found or not updated" });
        }

        res.status(200).json({ message: "Note updated successfully" });
    } catch (err) {
        console.error("Error updating note:", err);
        res.status(500).json({ error: "Failed to update note" });
    }
});

// Delete a note
router.delete("/:noteId", async (req, res) => {
    const { noteId } = req.params;

    try {
        const db = getDb();
        const notesCollection = db.collection("notes");

        const result = await notesCollection.deleteOne({ _id: new ObjectId(noteId) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Note not found" });
        }

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (err) {
        console.error("Error deleting note:", err);
        res.status(500).json({ error: "Failed to delete note" });
    }
});

module.exports = router;
