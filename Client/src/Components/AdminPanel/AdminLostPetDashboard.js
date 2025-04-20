import React, { useState, useEffect } from "react";
import AdminPostContainer from "./AdminPostContainer";
import "./AdminDashboard.css";

/**
 * Admin dashboard for managing lost pet posts
 */
const AdminLostPetDashboard = () => {
  const [lostPetsData, setLostPetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all lost pets data
  const fetchLostPets = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/admin/allLostPets");
      if (!response.ok) {
        throw new Error("Failed to fetch lost pet reports");
      }
      const data = await response.json();
      setLostPetsData(data);
    } catch (err) {
      console.error("Error fetching lost pets:", err);
      setError("Failed to load lost pet reports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostPets();
  }, []);

  // Filter and search data
  const filteredLostPets = lostPetsData.filter((pet) => {
    // Filter by status
    const statusMatch = 
      filter === "all" || 
      (filter === "found" && pet.status === "Found") ||
      (filter === "lost" && pet.status === "Lost");
    
    // Filter by search query (case insensitive)
    const searchMatch = 
      pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.lastSeenLocation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Get unique pet types for filter dropdown
  const petTypes = [...new Set(lostPetsData.map(pet => pet.type).filter(Boolean))];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Lost Pet Reports Management</h1>
        <p>Manage all lost pet reports from this dashboard</p>
      </div>

      <div className="admin-dashboard-controls">
        <div className="admin-search-container">
          <input
            type="text"
            placeholder="Search by name, type or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-search-input"
          />
          <span className="admin-search-icon">
            <i className="fa fa-search"></i>
          </span>
        </div>

        <div className="admin-filter-container">
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Statuses</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>

          <label htmlFor="type-filter">Pet Type:</label>
          <select
            id="type-filter"
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-select"
          >
            <option value="">All Types</option>
            {petTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <button className="admin-refresh-btn" onClick={fetchLostPets}>
          <i className="fa fa-refresh"></i> Refresh Data
        </button>
      </div>

      <div className="admin-dashboard-content">
        <div className="admin-dashboard-stats">
          <div className="admin-stat">
            <span className="admin-stat-number">{lostPetsData.length}</span>
            <span className="admin-stat-label">Total Reports</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-number">
              {lostPetsData.filter(pet => pet.status === "Lost").length}
            </span>
            <span className="admin-stat-label">Still Lost</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-number">
              {lostPetsData.filter(pet => pet.status === "Found").length}
            </span>
            <span className="admin-stat-label">Found</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-number">
              {lostPetsData.filter(pet => pet.reportedBy).length}
            </span>
            <span className="admin-stat-label">Unique Users</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading lost pet reports...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <p>{error}</p>
            <button onClick={fetchLostPets}>Try Again</button>
          </div>
        ) : filteredLostPets.length > 0 ? (
          <div className="admin-post-list">
            {filteredLostPets.map((pet) => (
              <AdminPostContainer
                key={pet._id}
                post={pet}
                type="lostPet"
                onRefresh={fetchLostPets}
              />
            ))}
          </div>
        ) : (
          <div className="admin-no-results">
            <i className="fa fa-search"></i>
            <p>No lost pet reports found matching your criteria</p>
            <button onClick={() => {setSearchQuery(""); setFilter("all");}}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLostPetDashboard;