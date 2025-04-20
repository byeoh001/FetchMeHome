import React, { useState, useEffect } from "react";
import "../../Styles/UserLostRequests.css";

const LostPetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [reportingFinderId, setReportingFinderId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:4000/myLostPetRequests/${currentUserId}`);
        if (!response.ok) throw new Error("Failed to fetch reports");

        const data = await response.json();
        console.log("Rendered Requests:", data);
        setRequests(data);
      } catch (error) {
        console.error("Error fetching lost pet requests:", error);
      }
    };

    fetchRequests();
  }, [currentUserId]);

  // Handle Accept Request
  const handleAcceptRequest = async (requestId, petId) => {
    try {
      const response = await fetch(`http://localhost:4000/acceptLostPetRequest/${requestId}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to accept request.");
      }
      alert("Request accepted successfully!");
      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === requestId ? { ...req, status: "Accepted" } : req
        )
      );

      setRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.petId === petId ? { ...req, petStatus: "Found" } : req
        )
      );

    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request.");
    }
  };

  // Handle Delete Request
  const handleDelete = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:4000/deleteLostPetRequest/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete request.");
      }

      alert("Request deleted successfully!");
      setRequests((prevRequests) => prevRequests.filter((req) => req._id !== requestId)); 
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request.");
    }
  };

  // Handle Select Image for Report
  const handleSelectImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      console.log("Selected Image:", file);
    }
  };

  // Handle Submit Report
  const handleSubmitReport = async (finderId) => {
    if (!finderId) {
      alert("Error: Finder ID is missing.");
      return;
    }

    if (!selectedImage) {
      alert("Error: Please select an image for the report.");
      return;
    }

    const justification = prompt("Why are you reporting this user? (Required)");
    if (!justification || !justification.trim()) {
      alert("Please provide a justification.");
      return;
    }
    
    // Extract the actual ID value from the finderId object
    // The finderId from your data is an object with _id property
    const finderIdValue = finderId._id ? finderId._id : finderId;
    
    console.log("Reporting user:", finderIdValue, "by", currentUserId);
    console.log("Selected Image:", selectedImage);

    const formData = new FormData();
    formData.append("finderId", finderIdValue);
    formData.append("reportedBy", currentUserId);
    formData.append("justification", justification);
    formData.append("image", selectedImage);

    console.log("FormData being sent:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      const response = await fetch("http://localhost:4000/reportUser", {
        method: "POST",
        body: formData, // Send as FormData
      });

      if (!response.ok) {
        throw new Error("Failed to report user.");
      }

      alert("User reported successfully! The admin will review the case.");
      setSelectedImage(null);
      setReportingFinderId(null);
    } catch (error) {
      console.error("Error reporting user:", error);
      alert("Failed to report user.");
    }
  };

  return (
    <div className="req-container">
      {/* PENDING REQUESTS */}
      <section className="request-section">
        <h2 className="section-title">🐾 Pending Requests</h2>
        {requests.filter((req) => req.status === "Pending").length > 0 ? (
          <div className="requests-grid">
            {requests.filter((req) => req.status === "Pending").map((req) => (
              <div key={req._id} className="pet-view-card request-card">
                <div className="pet-card-pic">
                  <img src={`http://localhost:4000/Assets/${req.image}`} alt="Found Pet" className="pet-image" />
                </div>
                <div className="pet-card-details">
                  <p><b>PetFinder Email:</b> {req.finderEmail}</p>
                  <p><b>Contact:</b> {req.finderPhone}</p>
                  <p><b>Status:</b> <span className="status-badge pending">{req.status}</span></p>
                </div>
                <div className="app-rej-btn">
                  <button className="accept-request-btn" onClick={() => handleAcceptRequest(req._id, req.petId)}>Accept</button>
                  <button className="delete-request-btn" onClick={() => handleDelete(req._id)}>Delete</button>
                  <button className="report-user-btn" onClick={() => {
                    console.log("Finder ID object:", req.finderId);
                    setReportingFinderId(req.finderId);
                  }}>Report</button>
                </div>
                {reportingFinderId === req.finderId && (
                  <div className="image-upload-section">
                    <label><b>Upload an Image:</b></label>
                    <input type="file" accept="image/*" onChange={handleSelectImage} />
                    <button 
                      className="submit-report-btn" 
                      onClick={() => handleSubmitReport(req.finderId)}
                      disabled={!selectedImage}
                    >
                      Submit Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-requests-message">
            <i className="fa fa-inbox"></i>
            <p>No pending requests at the moment.</p>
          </div>
        )}
      </section>

      {/* ACCEPTED REQUESTS */}
      <section className="request-section">
        <h2 className="section-title">✅ Accepted Requests</h2>
        {requests.filter((req) => req.status === "Accepted").length > 0 ? (
          <div className="requests-grid">
            {requests.filter((req) => req.status === "Accepted").map((req) => (
              <div key={req._id} className="pet-view-card request-card">
                <div className="pet-card-pic">
                  <img src={`http://localhost:4000/Assets/${req.image}`} alt="Found Pet" className="pet-image" />
                </div>
                <div className="pet-card-details">
                  <p><b>PetFinder Email:</b> {req.finderEmail}</p>
                  <p><b>Contact:</b> {req.finderPhone}</p>
                  <p><b>Status:</b> <span className="status-badge accepted">{req.status}</span></p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-requests-message">
            <i className="fa fa-check-circle"></i>
            <p>No accepted requests at the moment.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default LostPetRequests;