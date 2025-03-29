const express = require('express');
const router = express.Router();
const { saveForm, getAdoptForms, deleteForm, deleteAllRequests, handleAdoptionRequest } = require('../Controller/AdoptFormController');

router.post('/save', saveForm);
// router.get('/getForms', getAdoptForms);
router.get('/getForms/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Find pets owned by the user
      const userPets = await Pet.find({ postedBy: userId }).select("_id");
      const petIds = userPets.map(pet => pet._id);
  
      // Get adoption requests for those pets
      const forms = await AdoptForm.find({ petId: { $in: petIds } }).sort({ createdAt: -1 });
  
      res.status(200).json(forms);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  
router.delete('/reject/:id', deleteForm);
router.delete('/delete/many/:id', deleteAllRequests);
router.get('/requests/:userId', getAdoptForms); // Fetch requests only for the pet owner
router.put('/handle/:userId', handleAdoptionRequest); // Approve/reject adoption request

module.exports = router;
