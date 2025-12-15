const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =======================
// 1) MONGOOSE MODEL (same file)
// =======================
const SocialSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
    linkedin: { type: String, default: "" },
  },
  { _id: false }
);

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, default: "" },
    bio: { type: String, default: "" },
    contact: { type: String, default: "" },
    socialMedia: { type: SocialSchema, default: () => ({}) },
    profilePhoto: { type: String, default: "" }, // store: "uploads/xxx.jpg" (NO leading slash)
  },
  { timestamps: true }
);

const Profile =
  mongoose.models.Profile || mongoose.model("Profile", ProfileSchema);

// =======================
// 2) MULTER SETUP (uploads)
// =======================
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// =======================
// 3) HELPERS
// =======================
const safeParseJSON = (str, fallback) => {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
};

const defaultProfile = (userIdObj) => ({
  userId: userIdObj,
  name: "",
  bio: "",
  contact: "",
  socialMedia: { facebook: "", twitter: "", instagram: "", linkedin: "" },
  profilePhoto: "",
});

// Remove leading "/" if any and build absolute path safely
const toAbsoluteUploadPath = (storedPath) => {
  if (!storedPath) return "";
  const clean = storedPath.startsWith("/") ? storedPath.slice(1) : storedPath; // "uploads/xx"
  return path.join(process.cwd(), clean);
};

// =======================
// 4) ROUTES
// =======================

// GET profile by userId (always returns consistent object)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);
    const profile = await Profile.findOne({ userId: userIdObj }).lean();

    return res.json(profile || defaultProfile(userIdObj));
  } catch (err) {
    console.error("GET profile error:", err);
    return res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// CREATE/UPDATE profile (UPSERT) + image upload
router.post("/", upload.single("profilePhoto"), async (req, res) => {
  try {
    const { userId, name = "", bio = "", contact = "", socialMedia = "{}" } =
      req.body;

    if (!userId) return res.status(400).json({ error: "userId is required" });
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const userIdObj = new mongoose.Types.ObjectId(userId);

    // Existing profile (for keeping old photo if no new upload)
    const existing = await Profile.findOne({ userId: userIdObj });

    // Parse socialMedia (frontend sends JSON string)
    const parsedSocial = safeParseJSON(
      socialMedia,
      existing?.socialMedia || {}
    );

    // ✅ store without leading slash (VERY IMPORTANT)
    const newPhoto = req.file ? `uploads/${req.file.filename}` : "";

    // keep old if no new photo
    const finalPhoto = newPhoto || existing?.profilePhoto || "";

    // ✅ delete old file if replaced
    if (newPhoto && existing?.profilePhoto && existing.profilePhoto !== newPhoto) {
      const oldAbs = toAbsoluteUploadPath(existing.profilePhoto);
      if (oldAbs) {
        fs.unlink(oldAbs, () => {}); // ignore errors
      }
    }

    const updated = await Profile.findOneAndUpdate(
      { userId: userIdObj },
      {
        userId: userIdObj,
        name,
        bio,
        contact,
        socialMedia: {
          facebook: parsedSocial.facebook || "",
          twitter: parsedSocial.twitter || "",
          instagram: parsedSocial.instagram || "",
          linkedin: parsedSocial.linkedin || "",
        },
        profilePhoto: finalPhoto,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json(updated);
  } catch (err) {
    console.error("SAVE profile error:", err);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

module.exports = router;
