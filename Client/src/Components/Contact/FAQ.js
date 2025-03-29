import React, { useState } from "react";
import "../../Styles/FAQ.css"; 

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null); 

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "What is FetchMeHome?",
      answer:
        "FetchMeHome is a platform designed to help pet owners find their lost pets, facilitate pet adoptions, and allow users to report found pets. It connects owners, adopters, and pet finders to ensure pets find their way home.",
    },
    {
      question: "Do I need an account to use FetchMeHome?",
      answer:
        "While you can browse lost pet and adoption listings without an account, you need to create one to report a lost pet, adopt a pet, or submit reports.",
    },
    {
      question: "How do I create an account?",
      answer:
        'Click "Register", enter your full name, email, password, and phone number, then verify your email to start using FetchMeHome.',
    },
    {
      question: "Is FetchMeHome free to use?",
      answer:
        "Yes! FetchMeHome is completely free for users who want to report lost pets or adopt pets.",
    },
    {
      question: "How do I report a lost pet?",
      answer:
        "1. Log in to your account.\n2. Click 'Services' on your dashboard.\n3. Fill in the required details (pet’s name, type, last seen location, description).\n4. Upload images and submit the listing.",
    },
    {
      question: "How do I adopt a pet?",
      answer:
        "1. Browse available adoption listings.\n2. Click 'Show Interest' on the pet you’re interested in.\n3. Fill in the required details, including housing situation and pet history.\n4. Wait for the owner to review and respond.",
    },
    {
      question: "How do I find lost pets near me?",
      answer:
        "Use the 'Find' feature to filter results based on location and pet type. A real-time map will display the last seen locations of lost pets.",
    },
    {
      question: "How can I report a user or a suspicious listing?",
      answer:
        "1. Go to the user’s profile or listing.\n2. Click 'Report' and provide evidence (images, justification).\n3. Admins will review your report and take appropriate action.",
    },
    {
      question: "What happens after I report a user or listing?",
      answer:
        "Admins will review the case and may:\n- Remove inappropriate listings.\n- Ban users for misconduct.\n- Dismiss false reports.",
    },
    {
      question: "How can I contact FetchMeHome support?",
      answer:
        "For further assistance, email support@fetchmehome.com or visit our Help Center.",
    },
  ];

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((item, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "open" : ""}`}
            onClick={() => toggleFAQ(index)}
          >
            <div className="faq-question">
              {item.question}
              <span className="faq-toggle">{openIndex === index ? "−" : "+"}</span>
            </div>
            {openIndex === index && <div className="faq-answer">{item.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
