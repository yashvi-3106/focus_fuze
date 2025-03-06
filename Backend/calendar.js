const express = require("express");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const router = express.Router();

const calendarEventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String },
});

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback"
);

const isAuthenticated = (req, res, next) => {
    console.log("Session in isAuthenticated:", req.session); // Debug session
    console.log("Session ID:", req.sessionID); // Debug session ID
    if (req.session.userId) {
      console.log("Authenticated userId:", req.session.userId);
      next();
    } else {
      console.log("Unauthorized: No session userId");
      res.status(401).json({ error: "Unauthorized" });
    }
  };

router.get("/:userId", isAuthenticated, async (req, res) => {
  try {
    const events = await CalendarEvent.find({ userId: req.params.userId });
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching events" });
  }
});

router.post("/", isAuthenticated, async (req, res) => {
  const { userId, title, date, description } = req.body;
  try {
    const event = new CalendarEvent({ userId, title, date, description });
    await event.save();

    const user = await mongoose.model("User").findById(userId);
    if (user.googleTokens) {
      oauth2Client.setCredentials(user.googleTokens);
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });
      const googleEvent = {
        summary: title,
        description,
        start: { date },
        end: { date },
      };
      await calendar.events.insert({
        calendarId: "primary",
        resource: googleEvent,
      });
    } else {
      return res.status(403).json({ error: "Google Calendar not authenticated", redirect: "/auth/google" });
    }

    res.status(201).json(event);
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ error: "Error adding event" });
  }
});

router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting event" });
  }
});

module.exports = router;