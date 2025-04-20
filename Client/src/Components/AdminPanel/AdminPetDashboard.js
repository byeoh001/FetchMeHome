import React, { useState, useEffect } from "react";
import AdminPostContainer from "./AdminPostContainer";
import "./AdminDashboard.css";

/**
 * Admin dashboard for managing adoption pet posts
 */
const AdminPetDashboard = () => {
  const [petsData, setPetsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all pets data
  const fetchPets = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4000/allPets");
      if (!response.ok) {
        throw new Error("Failed to fetch pet listings");
      }
      const data = await response.json();
      setPetsData(data);
    } catch (err) {
      console.error("Error fetching pets:", err);
      setError("Failed to load pet listings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  // Filter and search data
  const filteredPets = petsData.filter((pet) => {
    // Filter by status
    const statusMatch = 
      filter === "all" || 
      (filter === "approved" && pet.status === "Approved") ||
      (filter === "pending" && pet.status === "Pending") ||
      (filter === "adopted" && pet.status === "Adopted");
    
    // Filter by search query (case insensitive)
    const searchMatch = 
      pet.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pet.area?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Get unique pet types for filter dropdown
  const petTypes = [...new Set(petsData.map(pet => pet.type).filter(Boolean))];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Adoption Pet Listings Management</h1>
        <p>Manage all pet adoption posts from this dashboard</p>
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
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="adopted">Adopted</option>
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

        <button className="admin-refresh-btn" onClick={fetchPets}>
          <i className="fa fa-refresh"></i> Refresh Data
        </button>
      </div>

      <div className="admin-dashboard-content">
        <div className="admin-dashboard-stats">
          <div className="admin-stat">
            <span className="admin-stat-number">{petsData.length}</span>
            <span className="admin-stat-label">Total Listings</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-number">
              {petsData.filter(pet => pet.status === "Approved").length}
            </span>
            <span className="admin-stat-label">Approved</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-number">
              {petsData.filter(pet => pet.status === "Pending").length}
            </span>
            <span className="admin-stat-label">Pending</span>
          </div>
          <div className="admin-stat">
            <span className="admin-stat-number">
              {petsData.filter(pet => pet.status === "Adopted").length}
            </span>
            <span className="admin-stat-label">Adopted</span>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading pet listings...</p>
          </div>
        ) : error ? (
          <div className="admin-error">
            <p>{error}</p>
            <button onClick={fetchPets}>Try Again</button>
          </div>
        ) : filteredPets.length > 0 ? (
          <div className="admin-post-list">
            {filteredPets.map((pet) => (
              <AdminPostContainer
                key={pet._id}
                post={pet}
                type="pet"
                onRefresh={fetchPets}
              />
            ))}
          </div>
        ) : (
          <div className="admin-no-results">
            <i className="fa fa-search"></i>
            <p>No pet listings found matching your criteria</p>
            <button onClick={() => {setSearchQuery(""); setFilter("all");}}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPetDashboard;