const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Mock database (replace with MongoDB or your DB)
let profiles = {};

// GET profile by userId
router.get("/:userId", (req, res) => {
  const { userId } = req.params;
  const profile = profiles[userId] || {};
  res.json(profile);
});

// POST or update profile
router.post("/", upload.single("profilePhoto"), (req, res) => {
  const { userId, name, bio, contact, socialMedia } = req.body;
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

  const profileData = {
    userId,
    name,
    bio,
    contact,
    socialMedia: JSON.parse(socialMedia),
    profilePhoto,
  };

  profiles[userId] = profileData; // Replace with your DB save logic
  res.status(201).json(profileData); // Return the full profile with photo URL
});

module.exports = router;