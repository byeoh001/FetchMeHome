import React, { useState } from "react";
import axios from "axios";

// Pet Personality Quiz Data
const petPersonalityQuiz = [
    {
        question: "What best describes your daily activity level?",
        options: [
            { label: "🏃‍♂️ Always on the move, love outdoor activities", value: "A" },
            { label: "🚶‍♂️ Enjoy occasional walks and light exercise", value: "B" },
            { label: "🛋 Prefer relaxing at home most of the time", value: "C" }
        ]
    },
    {
        question: "How much time can you dedicate to your pet daily?",
        options: [
            { label: "🕒 Several hours – I love spending time with animals!", value: "A" },
            { label: "⏳ A few hours – I can make time for care and play", value: "B" },
            { label: "⏰ Limited – I have a busy schedule but still want a companion", value: "C" }
        ]
    },
    {
        question: "How do you feel about grooming and maintenance?",
        options: [
            { label: "✂️ I enjoy grooming and don’t mind frequent upkeep", value: "A" },
            { label: "🧼 Moderate grooming is fine, but nothing too high-maintenance", value: "B" },
            { label: "🏠 I prefer low-maintenance pets that require minimal grooming", value: "C" }
        ]
    },
    {
        question: "What is your home environment like?",
        options: [
            { label: "🏡 Spacious home with a backyard", value: "A" },
            { label: "🏢 Apartment or small living space", value: "B" },
            { label: "🌆 Live in a busy city with limited outdoor access", value: "C" }
        ]
    },
    {
        question: "How do you handle noise and energy levels in a pet?",
        options: [
            { label: "🔊 Love energetic, playful pets – bring on the fun!", value: "A" },
            { label: "😌 Prefer a balanced pet – playful but calm at times", value: "B" },
            { label: "🤫 Enjoy quiet and relaxed pets that don’t make much noise", value: "C" }
        ]
    },
    {
        question: "What kind of temperament are you looking for in a pet?",
        options: [
            { label: "🧡 Loyal, protective, and always by my side", value: "A" },
            { label: "🎭 Playful, affectionate, and good with everyone", value: "B" },
            { label: "💤 Independent, calm, and doesn’t need constant attention", value: "C" }
        ]
    },
    {
        question: "How social are you?",
        options: [
            { label: "🎉 Very social! I love having people and pets around", value: "A" },
            { label: "👫 Somewhat social – I enjoy company but also alone time", value: "B" },
            { label: "☕ More introverted – I prefer a pet that doesn’t demand too much interaction", value: "C" }
        ]
    }
];

// Question Component
const Question = ({ question, options, selectedOption, onChange }) => {
    return (
        <div style={{ marginBottom: "15px" }}>
            <h2>{question}</h2>
            {options.map((option, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                        type="radio" 
                        name={question} 
                        value={option.value} 
                        checked={selectedOption === option.value}
                        onChange={() => onChange(option.value)}
                    />
                    <label>{option.label}</label>
                </div>
            ))}
        </div>
    );
};

// Main Personality Quiz Component
const Personality = () => {
    const [answers, setAnswers] = useState({});
    const [personality, setPersonality] = useState("");
    const [loading, setLoading] = useState(false); 

    const handleAnswerChange = (question, value) => {
        setAnswers((prev) => ({ ...prev, [question]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4000/api/personality", { answers });
            setPersonality(response.data.personality);
        } catch (error) {
            console.error("Error fetching personality:", error);
        }
        setLoading(false);
    };

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h1>Pet Personality Quiz</h1>
            {petPersonalityQuiz.map((q, index) => (
                <Question 
                    key={index} 
                    question={q.question} 
                    options={q.options} 
                    selectedOption={answers[q.question] || ""} 
                    onChange={(value) => handleAnswerChange(q.question, value)}
                />
            ))}
            <button 
                onClick={handleSubmit} 
                style={{
                    marginTop: "20px", 
                    padding: "10px 20px", 
                    backgroundColor: "#ff8800", 
                    color: "#fff", 
                    border: "none", 
                    cursor: "pointer",
                    fontSize: "16px"
                }}
                disabled={loading}
            >
                {loading ? "Analyzing..." : "Get My Result"}
            </button>

            {personality && (
                <h2 style={{ marginTop: "20px", color: "#ff8800" }}>
                    Your Personality Type: {personality}
                </h2>
            )}
        </div>
    );
};

export default Personality;
