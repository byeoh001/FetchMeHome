import React from 'react';
import PostAdoptPets from './PostAdoptPets';
import ViewAdoptSection from './ViewAdoptSection';
import ViewFindSection from './ViewFindSection';
import PostLostPets from './PostLostPets';
import '../../Styles/Services.css';

const Services = () => {
  const isLoggedIn = !!localStorage.getItem("token"); // Check if user is logged in

  return (
    <div className="services-container">
      <div className="services-header">
        <h1>Pet Services</h1>
        <p>Post your pets for adoption or report lost pets</p>
        {!isLoggedIn && (
          <div className="login-prompt">
            <p>Please <a href="/login">log in</a> or <a href="/register">register</a> to post pets for adoption or report lost pets</p>
          </div>
        )}
      </div>

      <div className="services-tabs">
        <div className="services-columns">
          <div className="services-column">
            <div className="service-card adoption-service" id="adopt">
              <h2>Post a Pet for Adoption</h2>
              <div className="service-content">
                {isLoggedIn ? <PostAdoptPets /> : <ViewAdoptSection />}
              </div>
            </div>
          </div>
          
          <div className="services-column">
            <div className="service-card lost-service" id="lost">
              <h2>Post a Lost Pet</h2>
              <div className="service-content">
                {isLoggedIn ? <PostLostPets /> : <ViewFindSection />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;