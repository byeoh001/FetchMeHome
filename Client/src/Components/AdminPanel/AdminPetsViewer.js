import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const AdminPetsViewer = (props) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBanning, setIsBanning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeleteListing = async (petId) => {
    if (!window.confirm("Are you sure you want to delete this pet listing?")) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:4000/admindeleteP/${petId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete pet listing");
      }
      setSuccessMessage("Pet listing deleted successfully");
      setShowSuccessMessage(true);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error("Error deleting listing:", err);
      alert(`Failed to delete listing: ${err.message}`);
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
      setTimeout(() => {
        window.location.reload(); setShowSuccessMessage(false);
      }, 1000);
    } catch (err) {
      console.error("Error banning user:", err);
      alert("Failed to ban user");
    } finally {
      setIsBanning(false);
    }
  };

  const formatTimeAgo = (updatedAt) => {
    const date = new Date(updatedAt);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const { pet } = props;
  const isAdopted = pet.status === "Adopted";

  return (
    <div className="pet-view-card">
      <div className="pet-card-pic">
        <img
          src={`http://localhost:4000/Assets/${pet.filename}`}
          alt={pet.name}
          onError={(e) => {
            e.target.src = "http://localhost:4000/Assets/default.png";
          }}
        />
      </div>
      <div className="pet-card-details">
        <h2>{pet.name}</h2>
        <p><b>Type:</b> {pet.type}</p>
        <p><b>Age:</b> {pet.age}</p>
        <p><b>Location:</b> {pet.area}</p>
        <p><b>Status:</b> {pet.status}</p>
        <p><b>Posted By:</b> {pet.postedBy?.name || "Unknown"}</p>
        <p>{formatTimeAgo(pet.updatedAt)}</p>
      </div>

      {/* Show buttons only if not adopted */}
      {!isAdopted && (
        <div className="admin-actions">
          <div className="button-group">
            <button
              className="delete-btn"
              onClick={() => handleDeleteListing(pet._id)}
              disabled={isDeleting}
            >
              {isDeleting ? <span className="button-spinner"></span> : <>Delete Listing</>}
            </button>

            <button
              className="ban-btn"
              onClick={() => handleBanUser(pet.postedBy._id)}
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

export default AdminPetsViewer;
