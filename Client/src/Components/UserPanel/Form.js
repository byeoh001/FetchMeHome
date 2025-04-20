import React, { useState, useRef } from 'react';

const Form = ({ form, pet, updateCards, deleteBtnText, approveBtn, currentUserId }) => {
  const [isReporting, setIsReporting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Debug log to see what's in the form object
  console.log("Form object:", form);

  const handleAction = async (action) => {
    try {
      console.log("📡 Sending API request:", { action, petId: pet._id, requestId: form._id });
      const response = await fetch(`http://localhost:4000/handle-adoption`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action,
          petId: pet._id,
          requestId: form._id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || "Failed to process request.");
        return;
      }

      alert(`Adoption request ${action.toLowerCase()}d successfully.`);
      updateCards();
    } catch (error) {
      console.error("Error handling adoption request:", error);
    }
  };

  // Handle Select Image for Report
  const handleSelectImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected image file:", file);
      console.log("File type:", file.type);
      console.log("File size:", file.size, "bytes");
      
      setSelectedImage(file);
    } else {
      console.log("No file selected");
    }
  };

  // Handle Upload Button Click
  const handleUploadClick = () => {
    if (!selectedImage) {
      alert("Please select an image file first");
      return;
    }

    const justification = prompt("Why are you reporting this user? (Required)");
    if (!justification || !justification.trim()) {
      alert("Please provide a justification.");
      return;
    }
    
    handleSubmitReport(justification);
  };

  // Handle Submit Report
  const handleSubmitReport = async (justification) => {
    // Determine userId from form structure
    const userIdToReport = form._id || form.userId;
    
    console.log("Reporting user ID:", userIdToReport);
    console.log("Current user ID:", currentUserId);

    if (!userIdToReport) {
      alert("Error: Cannot identify the user to report. Missing user ID.");
      return;
    }

    if (!selectedImage) {
      alert("Error: Image is missing. Please select an image file.");
      return;
    }

    // Create FormData with only the essential fields
    const formData = new FormData();
    formData.append("finderId", userIdToReport);
    formData.append("reportedBy", currentUserId);
    formData.append("justification", justification);
    formData.append("image", selectedImage);
    
    // Log FormData contents for debugging
    console.log("Form data entries:");
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      // Use fetch without any Content-Type header
      const response = await fetch("http://localhost:4000/reportUser", {
        method: "POST",
        body: formData
      });

      // Check for successful response
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to report user");
        } catch (parseError) {
          throw new Error("Server error: " + errorText);
        }
      }

      // Success
      const result = await response.json();
      console.log("Report success:", result);
      alert("User reported successfully! The admin will review the case.");
      
      // Reset state
      setSelectedImage(null);
      setIsReporting(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error reporting user:", error);
      alert("Failed to report user: " + error.message);
    }
  };

  return (
    <div className="adoption-request-card">
      <div className="adopter-details">
        <p><strong>Adopter:</strong> {form.email}</p>
        <p><strong>Phone No:</strong> {form.phoneNo}</p>
        <p><strong>Living Situation:</strong> {form.livingSituation || "Not provided"}</p>
        <p><strong>Pet History:</strong> {form.previousExperience || "Not provided"}</p>
        <p><strong>Other Pets:</strong> {form.familyComposition || "Not provided"}</p>
        <p><strong>Status:</strong> <span className={`status-badge ${form.status.toLowerCase()}`}>{form.status}</span></p>
      </div>

      <div className="action-buttons">
        {approveBtn && (
          <>
            <button 
              onClick={() => handleAction("Approve")} 
              style={{ backgroundColor: "green", color: "white" }}
              className="approve-btn"
            >
              Approve
            </button>
            <button 
              onClick={() => handleAction("Reject")} 
              style={{ backgroundColor: "red", color: "white" }}
              className="reject-btn"
            >
              {deleteBtnText}
            </button>
            <button 
              onClick={() => setIsReporting(true)} 
              style={{ backgroundColor: "#f39c12", color: "white" }}
              className="report-btn"
            >
              Report
            </button>
          </>
        )}
      </div>

      {isReporting && (
        <div className="image-upload-section">
          <label><strong>Upload Evidence (Required):</strong></label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleSelectImage} 
            ref={fileInputRef}
          />
          {selectedImage && (
            <div className="upload-preview">
              <p>Selected: {selectedImage.name} ({Math.round(selectedImage.size/1024)} KB)</p>
              <button 
                onClick={handleUploadClick}
                style={{ backgroundColor: "red", color: "white", marginTop: "10px" }}
              >
                Submit Report
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Form;