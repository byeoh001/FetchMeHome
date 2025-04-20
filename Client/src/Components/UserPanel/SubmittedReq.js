import React, { useState, useEffect } from "react";
import "../../Styles/SubmittedReq.css";

const SubmittedReq = () => {
  const [lostPetRequests, setLostPetRequests] = useState([]);
  const [adoptionRequests, setAdoptionRequests] = useState([]);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchLostPetRequests = async () => {
      try {
        const response = await fetch(`http://localhost:4000/mySubmittedRequests/${currentUserId}`);
        const data = await response.json();
        setLostPetRequests(data);
      } catch (error) {
        console.error("Lost Pet Fetch Error:", error);
      }
    };

    const fetchAdoptionRequests = async () => {
      try {
        const response = await fetch(`http://localhost:4000/form/mySubmittedAdoptionRequests/${currentUserId}`);
        const data = await response.json();
        setAdoptionRequests(data);
      } catch (error) {
        console.error("Adoption Fetch Error:", error);
      }
    };

    fetchLostPetRequests();
    fetchAdoptionRequests();
  }, [currentUserId]);

  return (
    <div className="submitted-req-wrapper">
      <div className="request-section">
        <h3>Adoption Requests</h3>
        {adoptionRequests.length ? (
          adoptionRequests.map((req) => (
            <div key={req._id} className="request-card">
              <img src={`http://localhost:4000/Assets/${req.petId?.filename}`} alt="Adopt Pet" />
              <div>
                <p><strong>Name:</strong> {req.petId?.name}</p>
                <p><strong>Type:</strong> {req.petId?.type}</p>
                <p><strong>Owner:</strong> {req.ownerId?.email} | {req.ownerId?.phone}</p>
                <p className={`status ${req.status.toLowerCase()}`}>{req.status}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-requests" style={{ textAlign: "center", fontStyle: "italic" }}>No adoption requests submitted.</p>
        )}
      </div>

      <div className="request-section">
        <h3>Lost Pet Requests</h3>
        {lostPetRequests.length ? (
          lostPetRequests.map((req) => (
            <div key={req._id} className="request-card">
              <img src={`http://localhost:4000/Assets/${req.image}`} alt="Lost Pet" />
              <div>
                <p><strong>Name:</strong> {req.petId?.name}</p>
                <p><strong>Type:</strong> {req.petId?.type}</p>
                <p><strong>Your Contact:</strong> {req.finderEmail} | {req.finderPhone}</p>
                <p className={`status ${req.status.toLowerCase()}`}>{req.status}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-requests" style={{ textAlign: "center", fontStyle: "italic" }}>No lost pet reports submitted.</p>
        )}
      </div>
    </div>
  );
};

export default SubmittedReq;
