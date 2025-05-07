import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';
import Background from '../components/Background';
import Header from '../components/Header';
import home from "../assets/home.png";


const AboutUs = () => {
  return (
    <div className="about-page">
      <Background />

<Header 
  showAboutUs={false} 
  extraRightContent={
    <Link to="/">
      <img src={home} alt="Home" className="home-img" />
    </Link>
  } 
/>


<main className="about-content">
      <div className="about-summary">
        <h1 className="about-title">About Us</h1>

        <p>
        At <strong>KASIT Agenda</strong>, we believe that organizing events should be simple, efficient, and hassle-free.
         Our platform is designed to streamline the entire process—allowing organizers to schedule events, administrators to manage approvals,
         and attendees to stay informed with ease.
         </p>
       <p>
      With an intuitive interface,<strong> KASIT Agenda</strong> ensures that every event is well-planned and accessible.
       Whether you're booking a seminar, pr reserving a venue, our system keeps everything in order.
       </p>
       <p>
      Our goal is to provide a reliable and structured solution that simplifies event coordination for everyone.
       With seamless booking, clear approvals, and up-to-date event tracking, we make sure nothing gets overlooked.
        </p>
      </div>
    </main>
    </div>
  );
};

export default AboutUs;