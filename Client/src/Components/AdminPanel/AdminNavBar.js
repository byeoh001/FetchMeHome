import React, { useState, useEffect } from 'react';
import {useNavigate, Link} from "react-router-dom";
import logo from "../NavBar/images/logo.png";
import "../../Styles/AdminNavbar.css";

const AdminNavBar = () => {
  const navigate = useNavigate();
  const [authChanged, setAuthChanged] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdmin") === "true");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
    setIsAdmin(localStorage.getItem("isAdmin") === "true");
  }, [authChanged]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setAuthChanged(prev => !prev); // force re-evaluation
    navigate("/");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Format time as: Monday, April 16, 2023 - 10:30 AM
  const formattedTime = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }) + ' - ' + currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="admin-navbar">
      <div className="admin-navbar-container">
        <div className="admin-navbar-logo">
          <Link to="/adminhome">
            <img src={logo} alt="FetchMeHome Logo" />
            <span>FetchMeHome</span>
          </Link>
        </div>
        
        <div className="admin-navbar-time">
          <i className="fa fa-clock-o"></i>
          <span>{formattedTime}</span>
        </div>
        
        <div className="admin-navbar-toggler" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <div className={`admin-navbar-menu ${menuOpen ? 'active' : ''}`}>
          <ul className="admin-navbar-links">
            <li>
              <Link to="/adminhome">
                <i className="fa fa-home"></i>
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link to="/adminfind">
                <i className="fa fa-search"></i>
                <span>Find</span>
              </Link>
            </li>
            <li>
              <Link to="/adminpets">
                <i className="fa fa-paw"></i>
                <span>Adopt</span>
              </Link>
            </li>
            <li>
              <Link to="/adminpanel">
                <i className="fa fa-dashboard"></i>
                <span>Admin Panel</span>
              </Link>
            </li>
            <li className="admin-navbar-logout">
              <button onClick={handleLogout}>
                <i className="fa fa-sign-out"></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;