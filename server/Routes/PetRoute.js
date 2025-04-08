const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Pet = require("../Model/PetModel");
const AdoptForm = require("../Model/AdoptFormModel");
const Report = require("../Model/ReportModel");
const { postPetRequest, approveRequest, deletePost, allPets, requestAdoption, getAdoptionRequests, handleAdoptionRequest } = require('../Controller/PetController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../Assets'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get("/adoptedPets", allPets); // Now allPets receives (req, res) properly
// router.get("/approvedPets", allPets);
// router.get('/requests', (req, res) => allPets('Pending', req, res));
// router.get('/approvedPets', (req, res) => allPets('Approved', req, res));
router.get("/approvedPets/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching approved pets for Owner ID:", userId);

    const approvedPets = await Pet.find({ postedBy: userId, status: "Adopted" });
    console.log("Found approved pets:", approvedPets);
    res.status(200).json(approvedPets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/approving/:id', approveRequest);

router.delete("/deleteP/:petId", async (req, res) => {
  try {
      console.log(" DELETE request received!");
      console.log(" Request Params:", req.params);
      console.log(" Request Query Params:", req.query);

      const { petId } = req.params;
      const userId = req.query.userId; 

      if (!petId || !userId) {
          console.log(" Missing pet ID or user ID");
          return res.status(400).json({ error: "Missing pet ID or user ID" });
      }

      const pet = await Pet.findById(petId);
      console.log(" Found pet in database:", pet); 

      if (!pet) {
          console.log(" Pet not found in database");
          return res.status(404).json({ error: "Pet not found" });
      }

      if (!pet.postedBy) {
          console.log(" pet.postedBy is undefined");
          return res.status(500).json({ error: "pet.postedBy is undefined" });
      }

      if (pet.postedBy.toString() !== userId) {
          console.log(` Unauthorized: User ${userId} does not match ${pet.postedBy.toString()}`);
          return res.status(403).json({ error: "Unauthorized action" });
      }

      await Pet.findByIdAndDelete(petId);
      console.log(" Pet deleted successfully!");
      res.status(200).json({ message: "Pet deleted successfully" });

  } catch (error) {
      console.error(" ERROR deleting pet:", error);
      res.status(500).json({ error: error.message });
  }
});


router.post('/services', upload.single('picture'), postPetRequest);
router.post('/adoption-request', requestAdoption); // Users request to adopt
router.get('/adoption-requests/:ownerId', getAdoptionRequests); // Owners fetch adoption requests
router.patch('/handle-adoption', handleAdoptionRequest);

router.get("/myPets/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(" Fetching all pets posted by Owner ID:", userId);

    //  Fetch all pets where the logged-in user is the owner
    const userPets = await Pet.find({ postedBy: userId });

    console.log(" Found user pets:", userPets);
    res.status(200).json(userPets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/adoptedHistory/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(" Fetching adopted pets for Adopter ID:", userId);

    // Find all adoption requests where the user was the adopter and the request was approved
    const adoptedPets = await AdoptForm.find({ adopterId: userId, status: "Approved" })
      .populate("petId"); // Fetch pet details

    console.log(" Found adopted pets:", adoptedPets);
    res.status(200).json(adoptedPets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/report/:petId", async (req, res) => {
  try {
    const { petId } = req.params;
    const { reason } = req.body;

    // Check if the pet exists
    const pet = await Pet.findById(petId);
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }
    console.log(" Pet found:", pet);
    // Check if the pet is already reported
    const existingReport = await Report.findOne({ petId });
    if (existingReport) {
      console.log(" This listing has already been reported.");
      return res.status(400).json({ error: "This listing has already been reported." });
    }

    //  Save the full listing details in the report
    const report = new Report({
      petId,
      name: pet.name,
      type: pet.type,
      age: pet.age,
      area: pet.area,
      justification: pet.justification,
      filename: pet.filename,
      email: pet.email,
      phone: pet.phone,
      reason,
    });

    await report.save();

    res.status(200).json({ message: "Report submitted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }


  
});


router.patch('/updatePet/:id', async (req, res) => {
  try {
    const { id } = req.params; 
    console.log("Received request to update pet with ID:", id);// Get pet ID from URL
    const updatedData = req.body;
    console.log("Data received in request body:", updatedData); // Get updated pet data from request body
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(" Invalid pet ID format");
      return res.status(400).json({ message: 'Invalid pet ID' });
  }

    const updatedPet = await Pet.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedPet) {
      console.log("Pet not found in database");
      return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json(updatedPet); // Send updated pet data
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: 'Failed to update pet' });
  }
});




module.exports = router;
