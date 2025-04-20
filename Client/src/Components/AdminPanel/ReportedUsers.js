import React, { useState, useEffect } from "react";

const ReportedUsers = () => {
  const [reportedUsers, setReportedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportedUsers = async () => {
    try {
      const response = await fetch("http://localhost:4000/admin/reported-users");
      if (!response.ok) {
        throw new Error("Failed to fetch reported users.");
      }
      const data = await response.json();
      console.log("✅ Fetched Reported Users:", data);
      setReportedUsers(data);
    } catch (error) {
      console.error("Error fetching reported users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportedUsers();
  }, []);

  const handleBanUser = async (finderId) => {
    if (!window.confirm("Are you sure you want to ban this user?")) return;
  
    try {
      const res = await fetch(`http://localhost:4000/admin/banUser/${finderId}`, {
        method: "PATCH",
      });
  
      if (!res.ok) throw new Error("Failed to ban user");
  
      // Optional: Refresh the UI
      setReportedUsers((prev) =>
        prev.filter((report) => report.finderId !== finderId)
      );
  
      alert("User banned successfully and report removed.");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error banning user:", err);
      alert("Failed to ban user.");
    }
  };

  // Dismiss a user report (only remove from reported-users table)
  const handleDismissReport = async (finderId) => {
    if (!window.confirm("Are you sure you want to dismiss this report?")) return;
  
    try {
      const response = await fetch(`http://localhost:4000/admin/dismissUserReport/${finderId}`, {
        method: "DELETE",
      });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
  
      if (!response.ok) throw new Error("Failed to dismiss user report");
  
      setReportedUsers((prev) =>
        prev.filter((report) => report.finderId !== finderId)
      );
    } catch (error) {
      console.error(" Error dismissing user report:", error);
      alert("Failed to dismiss the report.");
      
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading reported users...</p>
      </div>
    );
  }

  if (reportedUsers.length === 0) {
    return (
      <div className="empty-state">
        <i className="fa fa-check-circle"></i>
        <h3>No Reported Users</h3>
        <p>There are currently no users that have been reported.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Reported Users</h2>
      <p className="admin-subtitle">Review and manage users reported by others</p>
      
      {reportedUsers.map((report) => (
        <div key={report._id} className="report-card">
          <div className="report-card-header">
            <h3>User: {report.finderId?.name || "newuser1"}</h3>
            <span className="report-timestamp">{formatDate(report.createdAt)}</span>
          </div>
          
          <div className="report-content">
            {report.image ? (
              <img
                src={`http://localhost:4000/Assets/${report.image}`}
                alt="Evidence"
                className="report-image"
                onError={(e) => { e.target.src = "http://localhost:4000/uploads/default.png"; }}
              />
            ) : (
              <div className="report-no-image">
                <i className="fa fa-image"></i>
                <span>No Image</span>
              </div>
            )}
            
            <div className="report-details">
              <p><b>Reported By:</b> {report.reportedBy?.name || "Unknown"}</p>
              <p><b>Status:</b> <span className={`status-badge ${report.status === 'Pending' ? 'status-pending' : 'status-reviewed'}`}>{report.status}</span></p>
              <p><b>Justification:</b> {report.justification || "No justification provided."}</p>
            </div>
          </div>
          
          <div className="report-actions">
            <button
              className="delete-btn"
              onClick={() => handleBanUser(report.finderId._id)}
            >
              <i className="fa fa-trash"></i> Ban User
            </button>
            <button className="ban-btn"
                    onClick={() => handleDismissReport(report.finderId._id)}>
              <i className="fa fa-ban"></i> Dismiss Report
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportedUsers;