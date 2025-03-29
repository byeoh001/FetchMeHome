const express = require("express");
const ollamaChat = require("../Controller/PersonalityController");
const router = express.Router();

// API Endpoint for Pet Personality Quiz
router.post("/personality", async (req, res) => {
    try {
        const quizAnswers = req.body.answers;

        if (!quizAnswers || typeof quizAnswers !== "object") {
            return res.status(400).json({ error: "Invalid input format." });
        }

        console.log("Received Quiz Answers:", quizAnswers);

        const personalityType = await ollamaChat.determinePersonality(quizAnswers);

        res.json({ personality: personalityType });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).json({ error: "Failed to generate personality" });
    }
});

module.exports = router;
