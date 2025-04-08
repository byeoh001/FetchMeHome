const express = require('express');
const router = express.Router();
const Report = require("../Model/ReportModel");
const ReportUser = require('../Model/ReportUserModel');
const multer = require("multer");

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./Assets"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  }
});

const upload = multer({ storage });



router.get("/admin/reported-listings", async (req, res) => {
  try {
    console.log("Fetching all reported listings...");

    // Fetch all reported listings (No need to populate `petId`)
    const reportedListings = await Report.find();

    if (!reportedListings.length) {
      return res.status(404).json({ message: "No reported listings found." });
    }

    console.log(" Found reported listings:", reportedListings);

    res.status(200).json(reportedListings);
  } catch (err) {
    console.error(" Error fetching reported listings:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/reportUser", upload.single("image"), async (req, res) => {
  try {
      console.log("Received Report Data (Body):", req.body);
      console.log("Uploaded Image (File):", req.file ? req.file.filename : "No image uploaded");

      const { finderId, reportedBy, justification } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!finderId || !reportedBy || !justification) {
          console.log("Missing required fields:", { finderId, reportedBy, justification });
          return res.status(400).json({ error: "Missing required fields." });
      }

      if (!image) {
          console.log("Image is required for reporting");
          return res.status(400).json({ error: "Image is required." });
      }

      const newReport = new ReportUser({
          finderId,
          reportedBy,
          image,
          justification,
          status: "Pending",
      });

      await newReport.save();
      res.status(201).json({ message: "User reported successfully." });
  } catch (error) {
      console.error("Error reporting user:", error);
      res.status(500).json({ error: "Failed to report user." });
  }
});


  
  

router.get("/admin/reported-users", async (req, res) => {
  try {
    console.log("Fetching all reported users...");
  
    // Fetch all reported users
    const reportedUsers = await ReportUser.find().sort({ createdAt: -1 });

    if (!reportedUsers.length) {
      return res.status(404).json({ message: "No reported users found." });
    }

    console.log("Found reported users:", reportedUsers);
    res.status(200).json(reportedUsers);
  } catch (err) {
    console.error("Error fetching reported users:", err);
    res.status(500).json({ error: err.message });
  }
});
  

module.exports = router;