
const AdoptForm = require('../Model/AdoptFormModel')
const express = require('express')


const saveForm = async (req, res) => {
    try {
        const { email, livingSituation, phoneNo, previousExperience, familyComposition, petId, adopterId } = req.body;

        // Find the pet to get the ownerId
        const pet = await Pet.findById(petId);
        if (!pet) {
            return res.status(404).json({ error: "Pet not found" });
        }

        // Ensure the ownerId is retrieved from the pet
        const ownerId = pet.postedBy;

        // Ensure the adopter is not the owner
        if (ownerId.toString() === adopterId) {
            return res.status(400).json({ error: "You cannot adopt your own pet" });
        }

        // Check if an adoption request already exists from this user
        const existingRequest = await AdoptForm.findOne({ petId, adopterId });
        if (existingRequest) {
            return res.status(400).json({ error: "You have already submitted an adoption request for this pet." });
        }

        const form = await AdoptForm.create({
            email,
            livingSituation,
            phoneNo,
            previousExperience,
            familyComposition,
            petId,
            ownerId, // Ensure request is linked to pet owner
            adopterId, // Ensure request is linked to adopter
            status: "Pending"
        });

        res.status(200).json(form);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const getAdoptForms = async (req, res) => {
    try {
        const { userId } = req.params; // Get user ID from request URL

        if (!userId) {
            return res.status(400).json({ error: "User ID is required." });
        }

        // Fetch all adoption requests where the logged-in user is the pet owner
        const forms = await AdoptForm.find({ ownerId: userId }).populate('adopterId', 'email name');

        if (forms.length === 0) {
            return res.status(404).json({ error: "No adoption requests found for your pets." });
        }

        res.status(200).json(forms);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


// }

const deleteForm = async (req, res) => {
    try {
        const { id, userId } = req.params;

        const form = await AdoptForm.findById(id);
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }

        // Ensure only the pet owner can delete the request
        if (form.ownerId.toString() !== userId) {
            return res.status(403).json({ error: "You are not authorized to delete this request." });
        }

        await AdoptForm.findByIdAndDelete(id);
        res.status(200).json({ message: "Form deleted successfully" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

const handleAdoptionRequest = async (req, res) => {
    try {
        const { formId, action } = req.body;
        // const { userId } = req.params; // Get user ID from request URL

        console.log("📌 Received API Request:", req.body);
        // console.log("🔑 User ID from Params:", userId);
        console.log("📡 Searching for formId:", formId);

        const form = await AdoptForm.findById(formId);
        if (!form) {
            return res.status(404).json({ message: "Adoption request not found" });
        }

        console.log("✅ Found Adoption Request:", form);

        form.status = action === "Approve" ? "Approved" : "Rejected";
        await form.save();

        res.status(200).json({ message: `Adoption request ${action.toLowerCase()}d successfully.` });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};




const deleteAllRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await AdoptForm.deleteMany({ petId: id });
        if (result.deletedCount === 0) {
            console.log("Forms not found");
            return res.status(404).json({ error: 'Forms not found' });
        }
        res.status(200).json({ message: 'Forms deleted successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    saveForm,
    getAdoptForms,
    deleteForm,
    deleteAllRequests,
    handleAdoptionRequest
}
