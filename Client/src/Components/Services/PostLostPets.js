import React, { useState, useEffect } from "react";
import "../../Styles/PostLost.css"; 
import LocationPicker from "./LocationPicker"; 
import lostPetImage from "./images/lostcat.jpg";

const PostLostPets = () => {
  const [name, setName] = useState("");
  const [petAge, setPetAge] = useState("");
  const [lastSeenLocation, setLastSeenLocation] = useState(""); 
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [type, setType] = useState("None");
  const [picture, setPicture] = useState(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [pickerId] = useState("lost-location-" + Math.random().toString(36).substring(2, 9));
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  // Inject critical CSS and attach/remove body class for scroll locking
  useEffect(() => {
    
    // Handler for location picker open state
    if (isLocationPickerOpen) {
      document.body.classList.add('picker-open');
    } else {
      document.body.classList.remove('picker-open');
    }
    
    return () => {
      document.body.classList.remove('picker-open');
    };
  }, [isLocationPickerOpen]);

  // Track location picker state
  const handleLocationPickerState = (isOpen) => {
    setIsLocationPickerOpen(isOpen);
  };

  // Get user data on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setEmail(userData.email || "");
    }
  }, []);

  useEffect(() => {
    if (!isSubmitting) {
      setEmailError(false);
      setFormError(false);
    }
  }, [isSubmitting]);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const isEmailValid = (email) => {
    const emailPattern = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    return emailPattern.test(email);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setPicture(selectedFile);
      setFileName(selectedFile.name);
      
      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    }
  };

  const resetForm = () => {
    setName("");
    setPetAge("");
    setLastSeenLocation("");
    setDescription("");
    setPhone("");
    setEmail("");
    setType("None");
    setPicture(null);
    setFileName("");
    setPreviewUrl(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!name) {
      newErrors.name = "Pet name is required";
      isValid = false;
    }

    if (!petAge) {
      newErrors.petAge = "Pet age is required";
      isValid = false;
    }

    if (!lastSeenLocation) {
      newErrors.lastSeenLocation = "Last seen location is required";
      isValid = false;
    }

    if (!description) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isEmailValid(email)) {
      newErrors.email = "Please enter a valid Gmail address";
      isValid = false;
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    }

    if (!picture) {
      newErrors.picture = "Please upload a picture of your pet";
      isValid = false;
    }

    if (type === "None") {
      newErrors.type = "Please select a pet type";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User is not logged in! Please log in first.");
      return;
    }

    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("petAge", petAge);
    formData.append("lastSeenLocation", lastSeenLocation); 
    formData.append("description", description);
    formData.append("email", email);
    formData.append("phone", phone);
    formData.append("userId", userId);
    formData.append("type", type);

    if (picture) {
      formData.append("picture", picture);
    }

    try {
      const response = await fetch("http://localhost:4000/lostPets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      console.log("Lost pet report submitted successfully");
      resetForm();
      togglePopup();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="post-lost-pet-section">
      <div className="form-header">
        <div className="form-icon">
          <i className="fa fa-search"></i>
        </div>
        <h2>Report a Lost Pet</h2>
        <p className="form-subheading">
          Provide details about your lost pet to help community members identify and return them safely
        </p>
      </div>

      <div className="form-container">
        <div className="form-image">
          <img src={lostPetImage} alt="Lost Pet" />
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data" className="submission-form">
          <div className="form-section">
            <div className="input-group">
              <div className="input-box">
                <label>Pet Name <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Enter pet name"
                  className={errors.name ? "error-input" : ""}
                />
                {errors.name && <p className="error-message">{errors.name}</p>}
              </div>

              <div className="input-box">
                <label>Pet Age <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={petAge} 
                  onChange={(e) => setPetAge(e.target.value)} 
                  placeholder="E.g. 3 years, 6 months"
                  className={errors.petAge ? "error-input" : ""}
                />
                {errors.petAge && <p className="error-message">{errors.petAge}</p>}
              </div>
            </div>

            <div className="input-box">
              <label>Pet Type <span className="required">*</span></label>
              <select 
                value={type} 
                onChange={(event) => setType(event.target.value)}
                className={`type-select ${errors.type ? "error-input" : ""}`}
              >
                <option value="None">Select pet type</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Rabbit">Rabbit</option>
                <option value="Bird">Bird</option>
                <option value="Fish">Fish</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && <p className="error-message">{errors.type}</p>}
            </div>

            <div className="input-box">
              <label>Pet Photo <span className="required">*</span></label>
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <span className="file-upload-text">
                    <i className="fa fa-upload"></i> {fileName || "Choose a Picture"}
                  </span>
                  <input 
                    className="file-input" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </label>
              </div>
              {errors.picture && <p className="error-message">{errors.picture}</p>}
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
            </div>

            <div id={pickerId} className={`input-box location-popup-active ${isLocationPickerOpen ? 'active-picker' : ''}`}>
              <label>Last Seen Location <span className="required">*</span></label>
              <LocationPicker 
                setLastSeenLocation={setLastSeenLocation} 
                onPopupStateChange={handleLocationPickerState}
              />
              {errors.lastSeenLocation && <p className="error-message">{errors.lastSeenLocation}</p>}
            </div>

            <div className="input-box">
              <label>Description <span className="required">*</span></label>
              <textarea 
                rows="4" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your pet's appearance, distinctive features, behavior, etc."
                className={errors.description ? "error-input" : ""}
              ></textarea>
              {errors.description && <p className="error-message">{errors.description}</p>}
            </div>
          </div>

          <div className="form-section">
            <h3>Contact Information</h3>

            <div className="input-group">
              <div className="input-box">
                <label>Email <span className="required">*</span></label>
                <input 
                  type="text" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="your.email@gmail.com"
                  className={errors.email ? "error-input" : ""}
                />
                {errors.email && <p className="error-message">{errors.email}</p>}
              </div>

              <div className="input-box">
                <label>Phone Number <span className="required">*</span></label>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Your contact number"
                  className={errors.phone ? "error-input" : ""}
                />
                {errors.phone && <p className="error-message">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="submit-spinner"></div>
            ) : (
              <>
                <i className="fa fa-paper-plane"></i> Submit Lost Pet Report
              </>
            )}
          </button>
        </form>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-icon">
              <i className="fa fa-check-circle"></i>
            </div>
            <h3>Lost Pet Report Submitted!</h3>
            <p>Your lost pet has been reported. You can view your listing in the Find Tab.</p>
            <button onClick={togglePopup} className="popup-button">
              Got it!
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PostLostPets;