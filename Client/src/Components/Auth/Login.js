import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../../Styles/Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { email, password } = formData;
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      const res = await axios.post("http://localhost:4000/api/users/login", formData);
  
      if (res.data.user && res.data.user._id) {
        const { user, token } = res.data;
  
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user._id);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isAdmin", user.isAdmin);
  
        setIsLoading(false);
        setSuccess(`Welcome back, ${user.name}!`);
  
        // Navigate based on isAdmin
        setTimeout(() => {
          if (user.isAdmin) {
            navigate("/adminhome");
          } else {
            navigate("/");
          }
        }, 1500);
      } else {
        setIsLoading(false);
        setError("Invalid response from server");
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Login error:", err.response?.data?.msg || err.message);
      setError(err.response?.data?.msg || "Error logging in");
    }
  };
  

  return (
    <div className="simple-login-page">
      <div className="simple-login-container">
        <div className="login-title">
          <h1>FetchMeHome</h1>
          <h2>Welcome Back</h2>
          <p>Sign in to continue to FetchMeHome</p>
        </div>
        
        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={onSubmit} className="simple-login-form">
          <div className="form-group">
            <label htmlFor="email"></label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={onChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password"></label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={password}
              onChange={onChange}
              required
            />
          </div>
          
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              "Login"
            )}
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;