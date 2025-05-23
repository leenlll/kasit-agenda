import React from 'react';
import './LandingPage.css';
import Background from '../components/Background';
import Header from '../components/Header';
import view from '../assets/view.png';
import book from '../assets/book.png';
import admin from '../assets/admin.png';
import student from '../assets/studenticon.png';

const LandingPage = () => {
  const goToViewOnly = () => {
    window.location.href = '/ViewerDashboard';
  };

  const goToBooking = () => {
    window.location.href = '/organizer-signin';
  };

  const goToAdmins = () => {
    window.location.href = '/admins';  
};
const goToStudents = () => {
  window.location.href = '/StudentSignIn';
};

  return (
    <div className="landing-page">
      <Background />

      <Header showAboutUs={true} />


      <main className="hero-section">
        <div className="hero-content">
          <h2 className="welcome-title">Welcome to</h2>
          <p className="logotext">KASIT-Agenda!</p>
          <p className="welcome-description">
            Your go-to platform for discovering, organizing, and managing events effortlessly at{' '}
            <span className="highlight">King Abdullah II School of Information Technology</span>.
          </p>
        </div>



        <div className="cards-container">
            <div className="button-card" onClick={goToStudents}>
    <div className="card-content">
      <img src={student} alt="Students" className="card-image" />
      <h4 className="card-title">Students</h4>
    </div>
    <div className="hover-description">Check out and register for events</div>
  </div>
  
  <div className="button-card" onClick={goToBooking}>
    <div className="card-content">
      <img src={book} alt="Booking" className="card-image" />
      <h4 className="card-title">Booking</h4>
    </div>
    <div className="hover-description">Reserve and schedule events</div>
  </div>

  <div className="button-card" onClick={goToAdmins}>
    <div className="card-content">
      <img src={admin} alt="Administrators" className="card-image" />
      <h4 className="card-title">Administrators</h4>
    </div>
    <div className="hover-description">Manage events and permissions</div>
  </div>
  

  <div className="button-card" onClick={goToViewOnly}>
    <div className="card-content">
      <img src={view} alt="View Only" className="card-image" />
      <h4 className="card-title">View Only</h4> 
    </div>
    <div className="hover-description">Check out the latest events!</div>
  </div>

</div>

      </main>
    </div>
  );
};

export default LandingPage;
