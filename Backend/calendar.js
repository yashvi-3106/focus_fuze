// const express = require("express");
// const mongoose = require("mongoose");
// const { google } = require("googleapis");
// const router = express.Router();

// // Define the Calendar Event Schema
// const calendarEventSchema = new mongoose.Schema({
//   userId: { type: String, required: true },
//   title: { type: String, required: true },
//   date: { type: String, required: true },
//   description: { type: String },
// });

// const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);


// // Validate environment variables
// if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
//   console.error("Missing Google API credentials. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are set in .env");
//   process.exit(1);
// }

// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback"
// );

// const isAuthenticated = (req, res, next) => {
//   console.log("Session in isAuthenticated:", req.session);
//   console.log("Session ID:", req.sessionID);
//   if (req.session.userId) {
//     console.log("Authenticated userId:", req.session.userId);
//     next();
//   } else {
//     console.log("Unauthorized: No session userId");
//     res.status(401).json({ error: "Unauthorized" });
//   }
// };

// router.get("/:userId", isAuthenticated, async (req, res) => {
//   try {
//     const events = await CalendarEvent.find({ userId: req.params.userId });
//     res.status(200).json(events);
//   } catch (error) {
//     console.error("Error fetching events:", error);
//     res.status(500).json({ error: "Error fetching events" });
//   }
// });

// router.post("/", isAuthenticated, async (req, res) => {
//   const { userId, title, date, description } = req.body;

//   // Validate request body
//   if (!userId || !title || !date) {
//     console.log("Validation failed: Missing required fields", { userId, title, date });
//     return res.status(400).json({ error: "Missing required fields: userId, title, and date are required" });
//   }

//   try {
//     // Save the event locally first
//     const event = new CalendarEvent({ userId, title, date, description });
//     await event.save();
//     console.log("Event saved locally:", event);

//     // Send success response immediately
//     res.status(201).json(event);

//     // Attempt Google Calendar integration asynchronously
//     try {
//       const user = await User.findById(userId);
//       if (!user) {
//         console.log("User not found for userId:", userId);
//         return;
//       }

//       if (user.googleTokens) {
//         console.log("Google tokens found for user:", userId, user.googleTokens);
//         oauth2Client.setCredentials(user.googleTokens);

//         // Refresh the access token if expired
//         const { credentials } = await oauth2Client.getAccessToken();
//         if (credentials) {
//           console.log("Refreshed Google tokens:", credentials);
//           user.googleTokens = {
//             access_token: credentials.access_token,
//             refresh_token: user.googleTokens.refresh_token || credentials.refresh_token,
//             scope: user.googleTokens.scope,
//             token_type: user.googleTokens.token_type,
//             expiry_date: credentials.expiry_date,
//           };
//           await user.save();
//         } else {
//           console.log("Failed to refresh Google token for user:", userId);
//         }

//         const calendar = google.calendar({ version: "v3", auth: oauth2Client });
//         const googleEvent = {
//           summary: title,
//           description,
//           start: { date },
//           end: { date },
//         };
//         const googleResponse = await calendar.events.insert({
//           calendarId: "primary",
//           resource: googleEvent,
//         });
//         console.log("Event added to Google Calendar:", googleResponse.data);
//       } else {
//         console.log("Google Calendar not authenticated for user:", userId);
//       }
//     } catch (googleError) {
//       console.error("Error adding event to Google Calendar:", googleError);
//       if (googleError.response && googleError.response.data) {
//         console.error("Google API Error Details:", googleError.response.data);
//       }
//     }
//   } catch (error) {
//     console.error("Error adding event:", error);
//     res.status(500).json({ error: "Error adding event", details: error.message });
//   }
// });

// router.delete("/:id", isAuthenticated, async (req, res) => {
//   try {
//     await CalendarEvent.findByIdAndDelete(req.params.id);
//     res.status(200).json({ message: "Event deleted" });
//   } catch (error) {
//     console.error("Error deleting event:", error);
//     res.status(500).json({ error: "Error deleting event" });
//   }
// });

// module.exports = router;



const express = require("express");
const mongoose = require("mongoose");
const { google } = require("googleapis");
const router = express.Router();

// Define the Calendar Event Schema
const calendarEventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String },
});

const CalendarEvent = mongoose.model("CalendarEvent", calendarEventSchema);

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
  console.error("Missing Google API credentials. Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI are set in .env");
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/google/callback"
);

// GET: Fetch events for a user
router.get("/:userId", async (req, res) => {
  try {
    const events = await CalendarEvent.find({ userId: req.params.userId });
    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Error fetching events" });
  }
});

// POST: Add a new event
router.post("/", async (req, res) => {
  const { userId, title, date, description } = req.body;

  // Validate request body
  if (!userId || !title || !date) {
    console.log("Validation failed: Missing required fields", { userId, title, date });
    return res.status(400).json({ error: "Missing required fields: userId, title, and date are required" });
  }

  try {
    // Save the event locally first
    const event = new CalendarEvent({ userId, title, date, description });
    await event.save();
    console.log("Event saved locally:", event);

    // Send success response immediately
    res.status(201).json(event);

    // Attempt Google Calendar integration asynchronously (optional)
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.log("User not found for userId:", userId);
        return;
      }

      if (user.googleTokens) {
        console.log("Google tokens found for user:", userId, user.googleTokens);
        oauth2Client.setCredentials(user.googleTokens);

        const { credentials } = await oauth2Client.getAccessToken();
        if (credentials) {
          console.log("Refreshed Google tokens:", credentials);
          user.googleTokens = {
            access_token: credentials.access_token,
            refresh_token: user.googleTokens.refresh_token || credentials.refresh_token,
            scope: user.googleTokens.scope,
            token_type: user.googleTokens.token_type,
            expiry_date: credentials.expiry_date,
          };
          await user.save();
        }

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });
        const googleEvent = {
          summary: title,
          description,
          start: { date },
          end: { date },
        };
        const googleResponse = await calendar.events.insert({
          calendarId: "primary",
          resource: googleEvent,
        });
        console.log("Event added to Google Calendar:", googleResponse.data);
      } else {
        console.log("Google Calendar not authenticated for user:", userId);
      }
    } catch (googleError) {
      console.error("Error adding event to Google Calendar:", googleError);
    }
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ error: "Error adding event", details: error.message });
  }
});

// DELETE: Remove an event
router.delete("/:id", async (req, res) => {
  try {
    await CalendarEvent.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Error deleting event" });
  }
});

module.exports = router;