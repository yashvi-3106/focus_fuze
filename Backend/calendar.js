const express = require("express");
const { ObjectId } = require("mongodb");
const { getDb } = require("./db");  // Ensure this is properly imported

const router = express.Router();

// ✅ Add a new event
router.post("/", async (req, res) => {
    const { userId, title, date, description } = req.body;
    if (!userId || !title || !date) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const db = getDb();
        const eventsCollection = db.collection("calendarEvents");

        const newEvent = {
            userId,
            title,
            date,
            description,
            createdAt: new Date(),
        };

        const result = await eventsCollection.insertOne(newEvent);
        res.status(201).json({ message: "Event added successfully", eventId: result.insertedId });
    } catch (err) {
        console.error("Error adding event:", err);
        res.status(500).json({ error: "Failed to add event" });
    }
});

// ✅ Get all events for a user
router.get("/:userId", async (req, res) => {
    const { userId } = req.params;
    console.log("Fetching notes for userId (as string):", userId);
  
    try {
      const db = getDb();
      const eventsCollection = db.collection("calendarEvents");
  
      const calendarEvents = await eventsCollection.find({ userId }).toArray();
      console.log("Fetched calendarEvents:", calendarEvents); // Debugging
  
      res.status(200).json(calendarEvents);
    } catch (err) {
      console.error("Error fetching calendarEvents:", err);
      res.status(500).json({ error: "Failed to fetch calendarEvents" });
    }
  });

// ✅ Delete an event
router.delete("/:eventId", async (req, res) => {
    const { eventId } = req.params;

    try {
        const db = getDb();
        const eventsCollection = db.collection("calendarEvents");

        const result = await eventsCollection.deleteOne({ _id: new ObjectId(eventId) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (err) {
        console.error("Error deleting event:", err);
        res.status(500).json({ error: "Failed to delete event" });
    }
});

module.exports = router;
