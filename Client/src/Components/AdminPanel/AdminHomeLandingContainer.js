import React from "react";
import girlHoldingADog from "../Home/images/girlHoldingADog.png";
import homepageDog from "../Home/images/homepageDog.png";
import footPrint from "../Home/images/footPrint.png";
import { Link } from "react-router-dom";
import "../../Styles/Home.css";

const AdminHomeLandingContainer = () => {
  const scrollToTop = () => {
    window.scrollTo(0, 0);
  };
  
  return (
    <div className="home-container">
      <div className="homeContainer-left">
        <div className="home-title-container">
          <div className="home-titlePlusPng">
            <p>Your Pets</p>
            <img src={homepageDog} alt="Dog sitting" className="title-dog-image"/>
          </div>
          <div className="title-continuation">
            Are Our
            <br />
            Priority
          </div>
          <p className="home-second-para">
            Make sure you're ready to give a loving home to an adopted pet or help reunite a lost pet with its family.
          </p>
        </div>
        <div className="home-buttons-container">
          <Link to='/adminpets' style={{ textDecoration: "none" }}>
            <button className="Home-button" onClick={scrollToTop}>
              <span>Adopt a Pet</span>
              <img src={footPrint} alt="footprint" className="button-icon"/>
            </button>
          </Link>
          <Link to='/adminfind' style={{ textDecoration: "none" }}>
            <button className="Home-button" onClick={scrollToTop}>
              <span>Find a Pet</span>
              <img src={footPrint} alt="footprint" className="button-icon"/>
            </button>
          </Link>
        </div>
      </div>
      <div className="homeContainer-right">
        <img src={girlHoldingADog} alt='Girl holding a Dog' className="main-image"/>
      </div>
    </div>
  );
};

export default AdminHomeLandingContainer;