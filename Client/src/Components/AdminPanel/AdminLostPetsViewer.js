import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import "../../Styles/AdminLostPetsViewer.css";

const AdminLostPetsViewer = ({ pet }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeleteLostListing = async (petId) => {
    if (!window.confirm("Are you sure you want to delete this lost pet listing?")) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:4000/admin/deleteLost/${petId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete lost pet listing");

      setSuccessMessage("Lost pet listing deleted successfully");
      setShowSuccessMessage(true);
      setTimeout(() => window.location.reload(), 2000);
    } catch (err) {
      console.error("Error deleting lost pet listing:", err);
      alert("Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm("Are you sure you want to ban this user?")) return;
    setIsBanning(true);
    try {
      const response = await fetch(`http://localhost:4000/admin/banUser/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to ban user");

      setSuccessMessage("User banned successfully");
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (err) {
      console.error("Error banning user:", err);
      alert("Failed to ban user");
    } finally {
      setIsBanning(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return isNaN(date) ? "Invalid Date" : formatDistanceToNow(date, { addSuffix: true });
  };

  const isFound = pet.status?.toLowerCase() === "found";

  return (
    <div className="pet-view-card">
      <div className="pet-card-pic">
        <img
          src={pet.filename ? `http://localhost:4000/Assets/${pet.filename}` : "/default-image.jpg"}
          alt={pet.name}
          onError={(e) => (e.target.src = "/default-image.jpg")}
        />
      </div>
      <div className="pet-card-details">
        <h2>{pet.name}</h2>
        <p><b>Type:</b> {pet.type}</p>
        <p><b>Age:</b> {pet.petAge}</p>
        <p><b>Last Seen Location:</b> {pet.lastSeenLocation}</p>
        <p><b>Status:</b> {pet.status}</p>
        <p><b>Description:</b> {pet.description}</p>
        <p><b>Reported By:</b> {pet.reportedBy?.name || "Unknown"}</p>
        <p>{formatTimeAgo(pet.createdAt)}</p>
      </div>

      {/* Show admin buttons only if the pet is NOT marked as Found */}
      {!isFound && (
        <div className="admin-actions">
          <div className="button-group">
            <button
              className="delete-btn"
              onClick={() => handleDeleteLostListing(pet._id)}
              disabled={isDeleting}
            >
              {isDeleting ? <span className="button-spinner"></span> : <>Delete Listing</>}
            </button>

            <button
              className="ban-btn"
              onClick={() => handleBanUser(pet.reportedBy._id)}
              disabled={isBanning}
            >
              {isBanning ? <span className="button-spinner"></span> : <>Ban User</>}
            </button>
          </div>

          {showSuccessMessage && (
            <div className="success-message">
              <i className="fa fa-check-circle"></i> {successMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminLostPetsViewer;
