import React, { useState } from "react";
import "../../Styles/AdoptForm.css";

function AdoptForm(props) {
  const [email, setEmail] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [livingSituation, setLivingSituation] = useState("");
  const [previousExperience, setPreviousExperience] = useState("");
  const [familyComposition, setFamilyComposition] = useState("");
  const [formError, setFormError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ErrPopup, setErrPopup] = useState(false);
  const [SuccPopup, setSuccPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmailValid = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting Adoption Request...");
    setEmailError(false);
    setFormError(false);
    setErrorMessage("");

    if (
      !email ||
      !phoneNo ||
      !livingSituation ||
      !previousExperience ||
      !familyComposition
    ) {
      setFormError(true);
      return;
    }

    if (!isEmailValid(email)) {
      setEmailError(true);
      return;
    }

    const userId = localStorage.getItem("userId");
    console.log("👤 Logged-in User ID:", userId);

    if (!userId) {
      console.error("User is not logged in!");
      alert("You must be logged in to request an adoption.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:4000/form/save", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adopterId: userId, // Send as adopterId as expected by the controller
          email,
          phoneNo,
          livingSituation,
          previousExperience,
          familyComposition,
          petId: props.pet._id
        })
      });

      console.log("Server Response:", response);

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to submit adoption request");
        setErrPopup(true);
        return;
      } else {
        console.log("Adoption Request Submitted Successfully!");
        setSuccPopup(true);
      }
    }
    catch (err) {
      console.error(err);
      setErrorMessage("Connection error. Please try again later.");
      setErrPopup(true);
      return;
    } finally {
      setIsSubmitting(false);
    }

    setEmailError(false);
    setFormError(false);
    setEmail("");
    setPhoneNo("");
    setLivingSituation("");
    setPreviousExperience("");
    setFamilyComposition("");
  };

  return (
    <div className="custom-adopt-form-container">
      <h2 className="custom-form-heading">Pet Adoption Application</h2>
      <div className="form-pet-container">
        <div className="pet-details">
          <div className="pet-pic">
            <img src={`http://localhost:4000/Assets/${props.pet.filename}`} alt={props.pet.name} />
          </div>
          <div className="pet-info">
            <h2>{props.pet.name}</h2>
            <p>
              <b>Type:</b> {props.pet.type}
            </p>
            <p>
              <b>Age:</b> {props.pet.age}
            </p>
            <p>
              <b>Location:</b> {props.pet.location}
            </p>
          </div>
        </div>
        <div className="form-div">
          <form onSubmit={handleSubmit} className="custom-form">
            <div className="custom-input-box">
              <div className="email-not-valid">
                <label className="custom-label">Email:</label>
                {emailError && (
                  <p>
                    Please provide valid email address.
                  </p>
                )}
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="custom-input"
              />
            </div>
            <div className="custom-input-box">
              <label className="custom-label">Phone No.</label>
              <input
                type="text"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="custom-input"
              />
            </div>
            <div className="custom-input-box">
              <label className="custom-label">Living Situation:</label>
              <input
                type="text"
                value={livingSituation}
                onChange={(e) => setLivingSituation(e.target.value)}
                className="custom-input"
                placeholder="House, apartment, etc."
              />
            </div>
            <div className="custom-input-box">
              <label className="custom-label">Pet History:</label>
              <input
                type="text"
                value={previousExperience}
                onChange={(e) => setPreviousExperience(e.target.value)}
                className="custom-input"
                placeholder="Previous experience with pets"
              />
            </div>
            <div className="custom-input-box">
              <label className="custom-label">Any Other Pets:</label>
              <input
                type="text"
                value={familyComposition}
                onChange={(e) => setFamilyComposition(e.target.value)}
                className="custom-input"
                placeholder="List any other pets you currently have"
              />
            </div>
            {formError && (
              <p className="error-message">Please fill out all fields.</p>
            )}
            <button 
              disabled={isSubmitting} 
              type="submit" 
              className={`custom-cta-button custom-m-b ${isSubmitting ? 'loading' : ''}`}
            >
              {isSubmitting ? ' ' : 'Submit Application'}
            </button>
            {ErrPopup && (
              <div className="popup">
                <div className="popup-content">
                  <h4>
                    {errorMessage || "Oops!... Connection Error."}
                  </h4>
                </div>
                <button onClick={(e) => (setErrPopup(!ErrPopup))} className="close-btn">
                  Close <i className="fa fa-times"></i>
                </button>
              </div>
            )}
            {SuccPopup && (
              <>
                <div className="success-popup-overlay"></div>
                <div className="success-popup">
                  <div className="success-icon">
                    <i className="fa fa-check-circle"></i>
                  </div>
                  <div className="success-title">Success!</div>
                  <div className="success-message">
                    <div className="green-box">
                      Adoption Form for <strong>{props.pet.name}</strong> has been submitted!
                      <br />The owner will contact you soon.
                    </div>
                  </div>
                  <button
                    className="success-close-btn"
                    onClick={() => {
                      setSuccPopup(false);
                      setTimeout(() => props.closeForm(), 1000);
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdoptForm;