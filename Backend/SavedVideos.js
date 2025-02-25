const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Define Mongoose Schema and Model
const videoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Associate video with user
  videoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Video = mongoose.model("Video", videoSchema);

// Route to Save a Video (for a specific user)
router.post("/save", async (req, res) => {
  try {
    const { userId, videoUrl } = req.body;

    if (!userId || !videoUrl) {
      return res.status(400).json({ message: "User ID and video URL are required" });
    }

    if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const newVideo = new Video({ userId, videoUrl });
    await newVideo.save();

    res.status(201).json({ message: "Video saved successfully!" });
  } catch (error) {
    console.error("Error saving video:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to Fetch Saved Videos (for a specific user)
router.get("/saved/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      console.log("Fetching videos for userId:", userId); // Debugging
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID" });
      }
  
      const videos = await Video.find({ userId });
      console.log("Found videos:", videos); // Debugging
  
      if (videos.length === 0) {
        return res.status(404).json({ message: "No videos found for this user" });
      }
  
      res.status(200).json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  

// Route to Delete a Saved Video (Only if it belongs to the user)
router.delete("/delete/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId } = req.body; // User ID should be sent in request body for verification

    if (!mongoose.Types.ObjectId.isValid(videoId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const video = await Video.findOne({ _id: videoId, userId });

    if (!video) {
      return res.status(404).json({ message: "Video not found or does not belong to you" });
    }

    await Video.findByIdAndDelete(videoId);
    res.status(200).json({ message: "Video deleted successfully!" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


  

module.exports = router;
