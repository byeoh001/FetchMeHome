import React, { useState } from "react";
import axios from "axios";

// Modal Component
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 999
    }}>
      <div style={{
        backgroundColor: "#fff", padding: "30px", borderRadius: "10px",
        maxWidth: "700px", maxHeight: "90vh", overflowY: "auto",
        width: "90%", boxShadow: "0 4px 20px rgba(0,0,0,0.2)", position: "relative"
      }}>
        <button 
          onClick={onClose} 
          style={{
            position: "absolute", top: "15px", right: "15px",
            fontSize: "18px", border: "none", background: "none", cursor: "pointer"
          }}
        >
          ❌
        </button>
        {children}
      </div>
    </div>
  );
};

// Quiz Data
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
      { label: "🧼 Moderate grooming is fine", value: "B" },
      { label: "🏠 I prefer low-maintenance pets", value: "C" }
    ]
  },
  {
    question: "What is your home environment like?",
    options: [
      { label: "🏡 Spacious home with a backyard", value: "A" },
      { label: "🏢 Apartment or small living space", value: "B" },
      { label: "🌆 Busy city with limited outdoor access", value: "C" }
    ]
  },
  {
    question: "How do you handle noise and energy levels in a pet?",
    options: [
      { label: "🔊 Love energetic pets – bring on the fun!", value: "A" },
      { label: "😌 Balanced – playful but calm", value: "B" },
      { label: "🤫 Quiet and relaxed please", value: "C" }
    ]
  },
  {
    question: "What temperament are you looking for?",
    options: [
      { label: "🧡 Loyal, protective, always by my side", value: "A" },
      { label: "🎭 Playful, affectionate, good with everyone", value: "B" },
      { label: "💤 Independent and calm", value: "C" }
    ]
  },
  {
    question: "How social are you?",
    options: [
      { label: "🎉 Very social! Love company", value: "A" },
      { label: "👫 Somewhat social", value: "B" },
      { label: "☕ Introverted", value: "C" }
    ]
  }
];

// Single Question
const Question = ({ question, options, selectedOption, onChange }) => (
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

// Main Component
const Personality = () => {
  const [answers, setAnswers] = useState({});
  const [personality, setPersonality] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [breedSuggestions, setBreedSuggestions] = useState({ dogs: [], cats: [] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const handleAnswerChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4000/api/personality", { answers });
      setPersonality(res.data.personality);
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const handleBreedSuggestion = async () => {
    if (!personality || personality.includes("Unknown")) return;

    setSuggestLoading(true);
    try {
      const res = await axios.get("http://localhost:4000/api/suggest-breeds", {
        params: { traits: personality }
      });
      setBreedSuggestions({
        dogs: res.data.dogs || [],
        cats: res.data.cats || []
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error("Fetch error:", err);
    }
    setSuggestLoading(false);
  };

  // Save Pet Function
  const handleSavePet = async (pet) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:4000/api/users/save-pet", pet, {
        headers: { Authorization: token,
                   "Content-Type": "application/json"
         }
      });
      alert(`${pet.name} saved to your favorites!`);
    } catch (error) {
      console.error("Error saving pet:", error);
      alert("Failed to save pet.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Pet Personality Quiz</h1>

      {petPersonalityQuiz.map((q, idx) => (
        <Question
          key={idx}
          question={q.question}
          options={q.options}
          selectedOption={answers[q.question] || ""}
          onChange={(value) => handleAnswerChange(q.question, value)}
        />
      ))}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <button
          onClick={handleSubmit}
          style={{ padding: "10px 20px", backgroundColor: "#ff8800", color: "#fff", border: "none", cursor: "pointer" }}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Get My Personality Result!"}
        </button>

        <button
          onClick={handleBreedSuggestion}
          style={{ padding: "10px 20px", backgroundColor: "#0077cc", color: "#fff", border: "none", cursor: "pointer" }}
          disabled={suggestLoading}
        >
          {suggestLoading ? "Fetching..." : "Suggest A Pet For Me!"}
        </button>
      </div>

      {/* Result */}
      {personality && (
        <h2 style={{ marginTop: "20px", color: "#ff8800" }}>
          Your Personality Type: {personality}
        </h2>
      )}

      {/* Modal with Suggestions */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 style={{ textAlign: "center", fontSize: "30px", color: "orange" }}>Suggested Pets</h2>

        {/* Filter Tabs */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
          {["All", "Dog", "Cat"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveTab(type)}
              style={{
                padding: "8px 14px",
                backgroundColor: activeTab === type ? "#ff8800" : "#eee",
                color: activeTab === type ? "#fff" : "#333",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              {type}s
            </button>
          ))}
        </div>

        {/* Breed List */}
        <ul style={{ paddingLeft: "0" }}>
          {(activeTab === "All"
            ? [...breedSuggestions.dogs, ...breedSuggestions.cats]
            : activeTab === "Dog"
            ? breedSuggestions.dogs
            : breedSuggestions.cats
          ).map((breed, index) => (
            <li key={index} style={{
              marginBottom: "25px",
              paddingBottom: "10px",
              borderBottom: "1px solid #ddd",
              listStyle: "none"
            }}>
              <strong>{breed.name} ({breed.species})</strong><br />
              Temperament: {breed.temperament}<br />
              Life Span: {breed.life_span || "N/A"}<br />
              {breed.image?.url ? (
                <img
                  src={breed.image.url}
                  alt={breed.name}
                  style={{ width: "240px", marginTop: "10px", borderRadius: "8px" }}
                />
              ) : (
                <span style={{ color: "#999" }}>No image available</span>
              )}
              <br />
              {/* Save Button */}
              <button
                onClick={() => handleSavePet(breed)}
                style={{
                  marginTop: "8px",
                  backgroundColor: "#00aa55",
                  color: "#fff",
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                ❤️ Save Pet ❤️
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default Personality;
