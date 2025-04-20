import React, { useState, useEffect } from "react";
import AdminPanel from "./AdminPanel";
import "../../Styles/AdminLogin.css";
import logoImage from "../NavBar/images/logo.png"; // Import the logo

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await fetch('http://localhost:4000/admin/credentials');
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        const data = await response.json();
        setUsersData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUsersData();
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    const user = usersData.username === username && usersData.password === password;
    if (user) {
      setTimeout(() => {
        setLoginSuccess(true);
        setShowErrorMessage(false);
        setIsLoading(false);
      }, 1000); // Add a small delay for better UX
    } else {
      setTimeout(() => {
        setLoginSuccess(false);
        setShowErrorMessage(true);
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div>
      {loginSuccess ? (
        <AdminPanel />
      ) : (
        <div className="admin-login-container">
          <div className="admin-login-card">
            <div className="admin-login-logo">
              <img src={logoImage} alt="FetchMeHome Logo" />
              <h1>FetchMeHome</h1>
            </div>
            <h2>Admin Portal</h2>
            <p className="admin-login-subtitle">Enter your credentials to access the admin dashboard</p>
            
            <div className="admin-login-form">
              <div className="admin-form-group">
                <label htmlFor="username">Username</label>
                <div className="admin-input-with-icon">
                  <i className="fa fa-user"></i>
                  <input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="admin-form-group">
                <label htmlFor="password">Password</label>
                <div className="admin-input-with-icon">
                  <i className="fa fa-lock"></i>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              {showErrorMessage && (
                <div className="admin-error-message">
                  <i className="fa fa-exclamation-circle"></i>
                  <p>Incorrect username or password</p>
                </div>
              )}
              
              <button 
                className="admin-login-button" 
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="admin-loading-spinner"></span>
                ) : (
                  <>
                    <i className="fa fa-sign-in"></i> Login
                  </>
                )}
              </button>
            </div>
            
            <div className="admin-login-footer">
              <p>Return to <a href="/">main site</a></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;