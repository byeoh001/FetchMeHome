import React, { useState, useEffect } from "react";

const ReportedListing = () => {
  const [reportedListings, setReportedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportedListings = async () => {
    try {
      const response = await fetch("http://localhost:4000/admin/reported-listings");
      if (!response.ok) {
        throw new Error("Failed to fetch reported listings.");
      }
      const data = await response.json();
      setReportedListings(data);
    } catch (error) {
      console.error("🚨 Error fetching reported listings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedListings();
  }, []);

  const handleDismissReport = async (petId, reportType) => {
    if (!window.confirm("Are you sure you want to dismiss this report?")) return;
  
    const endpoint = reportType === "LostPet"
  ? `http://localhost:4000/admin/deleteLostPetReport/${petId}`
  : `http://localhost:4000/admin/dismissListingReport/${petId}`;

    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Failed to dismiss listing report");
  
      setReportedListings((prev) =>
        prev.filter((report) => report.petId !== petId)
      );

    } catch (error) {
      console.error("Error dismissing listing report:", error);
      alert("Failed to dismiss the report.");
    }
  };

  const handleDeleteListing = async (petId, reportType) => {
    const confirmMsg = `Are you sure you want to delete this ${reportType === "LostPet" ? "LostPet" : "Adoption"} listing?`;
    if (!window.confirm(confirmMsg)) return;
  
    const endpoint = reportType === "LostPet"
      ? `http://localhost:4000/admin/deleteLostPetListing/${petId}`
      : `http://localhost:4000/admin/deleteListing/${petId}`;
  
    try {
      const response = await fetch(endpoint, {
        method: "DELETE",
      });
  
      if (!response.ok) throw new Error("Failed to delete listing");
  
      // Refresh the list
      await fetchReportedListings();
  
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete the listing.");
    }
  };
  

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading reported listings...</p>
      </div>
    );
  }

  if (reportedListings.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa fa-check-circle"></i>
        <h3>No Reported Listings</h3>
        <p>There are currently no listings that have been reported by users.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Reported Listings</h2>
      <p className="admin-subtitle">Review and manage listings reported by users</p>

      {reportedListings.map((report) => (
        <div key={report._id} className="report-card">
          <div className="report-card-header">
            <h3>{report.name}</h3>
            <span className="report-timestamp">{formatDate(report.createdAt)}</span>
          </div>

          <div className="report-content">
            <img
              src={`http://localhost:4000/Assets/${report.filename}`}
              alt="Reported Pet"
              className="report-image"
              onError={(e) => {
                e.target.src = "http://localhost:4000/Assets/default.png";
              }}
            />

            <div className="report-details">
              <p><b>Type:</b> {report.type}</p>
              <p><b>Age:</b> {report.age}</p>
              <p><b>Location:</b> {report.area}</p>
              <p><b>Reason for Report:</b> {report.reason || "No reason provided"}</p>
              <p><b>Justification:</b> {report.justification || "No justification provided"}</p>
            </div>
          </div>

          <div className="report-actions">
            <button className="delete-btn" onClick={() => handleDeleteListing(report.petId,report.reportType)}>
              <i className="fa fa-trash"></i> Delete Listing
            </button>
            <button className="ban-btn" onClick={() => handleDismissReport(report.petId,report.reportType)}>
              <i className="fa fa-ban"></i> Dismiss Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportedListing;
