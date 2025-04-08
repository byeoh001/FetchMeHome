const Pet = require('../Model/PetModel');
const AdoptForm = require('../Model/AdoptFormModel');
const fs = require('fs');
const path = require('path');

const postPetRequest = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }
    const { name, age, area, justification, email, phone, type, userId  } = req.body;
    const { filename } = req.file;

    if (!name || !age || !area || !email || !phone || !type || !filename) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const pet = await Pet.create({
      name,
      age,
      area,
      justification,
      email,
      phone,
      type,
      filename,
      postedBy: userId, // Store the user ID
      status: 'Pending'
    });

    res.status(200).json(pet);
  } catch (error) {
    console.error("Error saving pet:", error);
    res.status(500).json({ error: error.message });
  }
};

const approveRequest = async (req, res) => {
  try {
    const id = req.params.id;

    const adoptionRequest = await AdoptForm.findById(requestId);
    if (!adoptionRequest) {
      return res.status(404).json({ error: 'Adoption request not found' });
    }

    const pet = await Pet.findById(adoptionRequest.petId);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Update pet to be "Adopted" and set the new owner's details
    pet.status = "Adopted";
    await pet.save();

    res.status(200).json(pet);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const handleAdoptionRequest = async (req, res) => {
  try {
    const {requestId, action } = req.body; // action = "Approve" or "Reject"

    const adoptionRequest = await AdoptForm.findById(requestId).populate("petId");
    if (!adoptionRequest) {
      return res.status(404).json({ error: "Adoption request not found" });
    }

    console.log(" Adoption request found:", adoptionRequest);

    adoptionRequest.status = action === "Approve" ? "Approved" : "Rejected";
    await adoptionRequest.save();

    // If approved, mark the pet as "Adopted"
    if (action === "Approve") {
      const pet = await Pet.findById(adoptionRequest.petId);
      if (pet) {
        pet.status = "Adopted"; //  Mark pet as Adopted
        await pet.save();
        // console.log(" Pet status updated to Adopted.");
      }
    }

    if (action === "Reject") {
      //  Remove the adoption request if rejected
      await AdoptForm.findByIdAndDelete(requestId);

      return res.status(200).json({ message: "Request rejected and removed successfully" });
    }


    res.status(200).json({ message: `Request ${action.toLowerCase()}d successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const allPets = async (req, res) => {
  try {
    const data = await Pet.find().sort({ updatedAt: -1 }); // Get ALL pets, no filtering
    if (data.length > 0) {
      res.status(200).json(data);
    } else {
      res.status(404).json({ error: "No data found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Get userId from request body
    
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Check if the logged-in user is the owner
    if (pet.postedBy.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized: You can only delete your own pet records.' });
    }

    await Pet.findByIdAndDelete(id);
    res.status(200).json({ message: 'Pet deleted successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const requestAdoption = async (req, res) => {
  try {
   
    const { petId, userId, email, phoneNo, livingSituation, previousExperience, familyComposition } = req.body;
    
      if (!petId || !userId) {
      return res.status(400).json({ error: "Pet ID and User ID are required" });
    }

    const pet = await Pet.findById(petId).populate("postedBy", "_id name email");;
    if (!pet) {
      return res.status(404).json({ error: "Pet not found" });
    }

    console.log("Pet found:", pet);


    const adoptionRequest = await AdoptForm.create({
      petId,
      adopterId: userId, 
      ownerId: pet.postedBy._id, 
      email, 
      phoneNo, 
      livingSituation, 
      previousExperience, 
      familyComposition,
      status: "Pending"
    });
    console.log("hi");
    console.log(" Adoption request created:", adoptionRequest);

    res.status(200).json({ message: "Adoption request submitted successfully", adoptionRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



const getAdoptionRequests = async (req, res) => {
  try {
    const { ownerId } = req.params; //  Logged-in owner ID

    console.log("Fetching adoption requests for Owner ID:", ownerId);

    if (!ownerId) {
      return res.status(400).json({ error: "Owner ID is required" });
    }

    const adoptionRequests = await AdoptForm.find({ownerId})
      .populate("adopterId", "name email") //  Fetch adopter details
      .populate("petId", "name type"); //  Fetch pet details

      console.log("Found adoption requests:", adoptionRequests);

    if (adoptionRequests.length === 0) {
      return res.status(404).json({ error: "No adoption requests found for this user" });
    }

    res.status(200).json(adoptionRequests);
  } catch (err) {
    console.error("Error fetching adoption requests:", err.message);
    res.status(500).json({ error: err.message });
  }
};



module.exports = {
  postPetRequest,
  approveRequest,
  deletePost,
  allPets,
  requestAdoption,
  getAdoptionRequests,
  handleAdoptionRequest
};
