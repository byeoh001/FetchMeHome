const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");
const auth = require("../Middleware/authMiddleware");
const router = express.Router();

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
    const token = jwt.sign({ id: user._id}, "secret", { expiresIn: "7d" });

    res.json({ token, user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin} });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
