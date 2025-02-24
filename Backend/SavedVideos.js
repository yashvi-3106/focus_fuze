const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Define Mongoose Schema and Model
const videoSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model("Video", videoSchema);

// Route to Save a Video
router.post("/save", async (req, res) => {
  try {
    const { videoUrl } = req.body;
    if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }

    const newVideo = new Video({ videoUrl });
    await newVideo.save();
    res.status(201).json({ message: "Video saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to Fetch Saved Videos
router.get("/saved", async (req, res) => {
  try {
    const videos = await Video.find();
    res.status(200).json(videos);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Route to Delete a Saved Video
router.delete("/delete/:id", async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Video deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
