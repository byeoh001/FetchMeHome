const LostPet = require('../Model/LostPetModel');
const fs = require('fs');
const path = require('path');

const postLostPetRequest = async (req, res) => {
  try {
    // Check if a file (picture) was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    // Extract fields from the request body
    const { name, petAge, lastSeenLocation, description, email, phone, type, userId } = req.body;
    const { filename } = req.file; // Get uploaded image filename

    // Validate required fields
    if (!name || !petAge || !lastSeenLocation || !description || !email || !phone || !type || !filename) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID (reportedBy) is required" });
    }

    // Create lost pet listing in the database
    const lostPet = await LostPet.create({
      name,
      petAge,
      lastSeenLocation,
      description,
      email,
      phone,
      type,
      filename,
      reportedBy: userId, // Owner who reported the lost pet
      status: 'Missing'
    });

    res.status(200).json(lostPet);
  } catch (error) {
    console.error("Error saving lost pet:", error);
    res.status(500).json({ error: error.message });
  }
};

const allLostPets = async (req, res) => {
  try {
    const data = await LostPet.find().sort({ createdAt: -1 }); // Get ALL lost pets, sorted by newest first
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: "No lost pets found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const uploadImageForPet = async (req, res) => {
  try {
    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }
    
    const { petId, userId } = req.body;
    const { filename } = req.file;
    
    // Validate required fields
    if (!petId || !userId || !filename) {
      return res.status(400).json({ error: "Missing required fields!" });
    }
    
    // Here you can handle the uploaded image and notify the owner,
    // For example, create a new document in an "Uploads" collection
    // or send an email to the owner.
    
    // For now, we'll just return a success response:
    res.status(200).json({ message: "Image uploaded successfully", filename });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { uploadImageForPet };


module.exports = { allLostPets };



const approveLostPetRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, phone, status } = req.body;
    const lostPet = await LostPet.findByIdAndUpdate(id, { email, phone, status }, { new: true });

    if (!lostPet) {
      return res.status(404).json({ error: 'Lost pet not found' });
    }

    res.status(200).json(lostPet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deleteLostPetPost = async (req, res) => {
  try {
    const id = req.params.id;
    const lostPet = await LostPet.findByIdAndDelete(id);
    if (!lostPet) {
      return res.status(404).json({ error: 'Lost pet not found' });
    }
    const filePath = path.join(__dirname, '../Assets', lostPet.filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.status(200).json({ message: 'Lost pet post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  postLostPetRequest,
  approveLostPetRequest,
  deleteLostPetPost,
  allLostPets,
  uploadImageForPet
};
