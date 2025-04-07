const express = require("express");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const auth = require("../Middleware/authMiddleware");
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "Assets/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const upload = multer({ storage });

// User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists. Please Login instead." });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.json({ msg: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Email or Password!" });

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Email or Password!" });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Profile
router.put("/update", auth, async (req, res) => {
  try {
    const { email, password } = req.body;

    const updateData = {};
    if (email) updateData.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });

    res.json({ msg: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


router.put("/upload-image", auth, upload.single("profileImage"), async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: `http://localhost:4000/Assets/${req.file.filename}` },
      { new: true }
    );
    res.json({ msg: "Image updated", profileImage: updated.profileImage });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});


router.post("/save-pet", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const pet = req.body;

    console.log("👉 Pet being saved:", pet);
    console.log("👉 User:", user.email);

    if (!user) return res.status(404).json({ msg: "User not found" });
    if (!pet || !pet.name || !pet.species) {
      return res.status(400).json({ msg: "Incomplete pet data" });
    }

    user.savedPets.push({
      name: pet.name,
      species: pet.species,
      temperament: pet.temperament,
      life_span: pet.life_span,
      image: pet.image?.url || ""
    });

    await user.save();
    res.json({ msg: "Pet saved successfully!" });
  } catch (err) {
    console.error("❌ Error saving pet:", err);
    res.status(500).json({ msg: "Server error saving pet" });
  }
});


router.get("/saved-pets", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ savedPets: user.savedPets });
  } catch (err) {
    console.error("❌ Error fetching saved pets:", err);
    res.status(500).json({ msg: "Server error" });
  }
});




module.exports = router;
