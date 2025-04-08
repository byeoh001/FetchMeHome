const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const LostPet = require("../Model/LostPetModel")
const LostPetRequest = require("../Model/LostPetRequestModel");
const { postLostPetRequest, approveLostPetRequest, deleteLostPetPost, allLostPets, uploadImageForPet } = require('../Controller/LostPetController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../Assets')); // Ensure Lost Pet images are saved in the same directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post('/lostPets', upload.single('picture'), postLostPetRequest);
router.get('/lostPets', allLostPets);
router.post('/uploadImage', upload.single('picture'), uploadImageForPet);
router.get("/myLostPets/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const lostPets = await LostPet.find({ reportedBy: userId }).sort({ createdAt: -1 });

    if (!lostPets.length) {
      return res.status(404).json({ message: "No lost pets found for this user." });
    }

    res.status(200).json(lostPets);
  } catch (error) {
    console.error("Error fetching lost pets:", error);
    res.status(500).json({ error: "Failed to fetch lost pets." });
  }
});
router.patch("/updateLostPet/:petId", async (req, res) => {
  try {
    const { petId } = req.params;
    const { userId, name, type, petAge, lastSeenLocation, email, phone, description } = req.body;

    console.log("Received Update Request for Pet ID:", petId);
    console.log("Request Body:", req.body);

    if (!userId) {
      console.error("Error: Missing userId in request body");
      return res.status(400).json({ error: "User ID is required" });
    }

    // Find the lost pet
    const lostPet = await LostPet.findById(petId);
    if (!lostPet) {
      return res.status(404).json({ error: "Lost pet not found." });
    }

    // Check if the user making the request is the original reporter
    if (lostPet.reportedBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only edit your own reports." });
    }

    // Update the pet details
    lostPet.name = name || lostPet.name;
    lostPet.type = type || lostPet.type;
    lostPet.petAge = petAge || lostPet.petAge;
    lostPet.lastSeenLocation = lastSeenLocation || lostPet.lastSeenLocation;
    lostPet.email = email || lostPet.email;
    lostPet.phone = phone || lostPet.phone;
    lostPet.description = description || lostPet.description;

    await lostPet.save();
    console.log("Pet updated successfully:", lostPet);

    res.status(200).json({ message: "Lost pet updated successfully.", lostPet });
  } catch (error) {
    console.error("Error updating lost pet:", error);
    res.status(500).json({ error: "Failed to update lost pet report." });
  }
});

router.post("/reportFoundPet", upload.single("image"), async (req, res) => {
  try {
    const { petId, finderId, finderEmail, finderPhone } = req.body;

    if (!petId || !finderId || !finderEmail || !finderPhone || !req.file) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newRequest = new LostPetRequest({
      petId,
      finderId,
      finderEmail,
      finderPhone,
      image: req.file.filename,
      status: "Pending"
    });

    await newRequest.save();
    res.status(201).json({ message: "Report sent to pet owner!" });
  } catch (error) {
    console.error("Error reporting found pet:", error);
    res.status(500).json({ error: "Failed to report found pet" });
  }
});

router.delete("/deleteLostPet/:petId", async (req, res) => {
  try {
    const { petId } = req.params;
    const { userId } = req.body; // userId is sent in request body

    // Find the lost pet
    const lostPet = await LostPet.findById(petId);
    if (!lostPet) {
      return res.status(404).json({ error: "Lost pet not found." });
    }

    // Check if the user making the request is the original reporter
    if (lostPet.reportedBy.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized: You can only delete your own reports." });
    }

    await lostPet.deleteOne();

    res.status(200).json({ message: "Lost pet report deleted successfully." });
  } catch (error) {
    console.error("Error deleting lost pet:", error);
    res.status(500).json({ error: "Failed to delete lost pet report." });
  }
});

router.get("/myLostPetRequests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // // Filter only lost pets that belong to the logged-in user
    // const userReports = reports.filter(report => report.petId.reportedBy.toString() === userId);
    const reports = await LostPetRequest.find()
      .populate({
        path: "petId",
        select: "reportedBy name type",
      })
      .populate("finderId", "email phone") // Ensure finderId is included
      .sort({ createdAt: -1 });

    console.log("Fetched Reports:", reports);

    // Filter only lost pets that belong to the logged-in user
    const userReports = reports.filter(report => report.petId?.reportedBy?.toString() === userId);

    res.status(200).json(userReports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

router.delete("/deleteLostPetRequest/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    const deletedRequest = await LostPetRequest.findByIdAndDelete(requestId);
    if (!deletedRequest) {
      return res.status(404).json({ error: "Request not found." });
    }

    res.status(200).json({ message: "Lost pet request deleted successfully." });
  } catch (error) {
    console.error("Error deleting lost pet request:", error);
    res.status(500).json({ error: "Failed to delete request." });
  }
});


router.put("/acceptLostPetRequest/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;

    // Find the request
    const request = await LostPetRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // Update request status to "accepted"
    request.status = "Accepted";
    await request.save();

    const lostPet = await LostPet.findByIdAndUpdate(
      request.petId, 
      { status: "Found" }, 
      { new: true }
    );

    if (!lostPet) {
      return res.status(404).json({ error: "Lost Pet not found" });
    }

    console.log("Request Accepted and Lost Pet Listing Deleted:", request);

    res.status(200).json({ message: "Request accepted, lost pet listing deleted", updatedRequest: request });
  } catch (error) {
    console.error("Error accepting request:", error);
    res.status(500).json({ error: "Failed to accept request" });
  }
});




router.get("/mySubmittedRequests/:finderId", async (req, res) => {
  try {
    const { finderId } = req.params;

    if (!finderId) {
      return res.status(400).json({ error: "Finder ID is required" });
    }

    // Fetch submitted requests for the logged-in finder
    const submittedRequests = await LostPetRequest.find({ finderId })
      .populate({
        path: "petId",
        select: "name type", // Fetch pet details
      })
      .sort({ createdAt: -1 });

    console.log("Finder's Submitted Requests:", submittedRequests);
    res.status(200).json(submittedRequests);
  } catch (error) {
    console.error("Error fetching submitted requests:", error);
    res.status(500).json({ error: "Failed to fetch submitted requests" });
  }
});














router.get('/requests', (req, res) => allLostPets('Pending', req, res));
router.get('/approvedLostPets', (req, res) => allLostPets('Approved', req, res));
router.get('/foundPets', (req, res) => allLostPets('Found', req, res));
router.post('/report', upload.single('picture'), postLostPetRequest);
router.put('/approving/:id', approveLostPetRequest);
router.delete('/delete/:id', deleteLostPetPost);

module.exports = router;
