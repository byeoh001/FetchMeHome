import React from "react";
import CardBelowHome from "../Home/CardBelowHome";
import PlanningToAdoptAPet from "../Home/PlanningToAdoptAPet";
import "../../Styles/Home.css";
import AdminHomeLandingContainer from "./AdminHomeLandingContainer";
import AdminNavBar from "./AdminNavBar";
import Footer from "../Footer/Footer"

const AdminHomePage = () => {
  return (
    <>
      <AdminNavBar />
      <AdminHomeLandingContainer />
      <CardBelowHome />
      <PlanningToAdoptAPet />
      <Footer />
    </>
  );
};

export default AdminHomePage;