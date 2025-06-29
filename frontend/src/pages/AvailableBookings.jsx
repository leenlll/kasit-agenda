import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { motion } from "framer-motion";
import "./AvailableBookings.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import { auth } from "../firebaseConfig";
import viewRequestsIcon from "../assets/view-requests.png";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AvailableBookings = () => {
  const [availableDates, setAvailableDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const navigate = useNavigate();
  const handleLogout = async () => {
    const confirm = window.confirm("Are you sure you want to log out?");
    if (!confirm) return;
  
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };
  

 
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (!currentUser) {
      navigate("/");
    }
  });

  const fetchBookedDates = async () => {
    try {
      console.log("🔍 Fetching booked dates from Firestore...");

      const eventsCollection = collection(db, "events");
      const bookedQuery = query(eventsCollection, where("status", "==", "Approved"));

      const querySnapshot = await getDocs(bookedQuery);

      const bookedList = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        console.log("📌 Fetched Event:", eventData);

        if (!eventData.eventDate) {
          console.warn("⚠️ Skipping event with missing date:", eventData);
          return;
        }

        let eventDate;
        if (eventData.eventDate.toDate) {
          eventDate = eventData.eventDate.toDate();
        } else {
          eventDate = new Date(eventData.eventDate);
        }

        if (!isNaN(eventDate.getTime())) {
          bookedList.push(eventDate.toISOString().split("T")[0]);
        } else {
          console.warn("⚠️ Skipping invalid event date:", eventData);
        }
      });

      setBookedDates(bookedList);
      console.log("✅ Successfully fetched booked dates:", bookedList);
    } catch (error) {
      console.error("❌ Error fetching booked dates:", error);
    }
  };

  fetchBookedDates(); 

  return () => unsubscribe(); 
}, []);


  
  const tileClassName = ({ date }) => {
    const formattedDate = date.toISOString().split("T")[0];
    if (bookedDates.includes(formattedDate)) return "booked-day"; 
    return "available-day"; 
  };


  const handleDateClick = (date) => {
    const formattedDate = date.toISOString().split("T")[0];
    if (bookedDates.includes(formattedDate)) return;
    console.log("📅 Navigating to booking:", formattedDate);
    navigate(`/booking?date=${formattedDate}`);
  };

  return (
    <div className="available-bookings">
      <Background />
      <Header
  showAboutUs={false}
  extraRightContent={
    <div className="header-icons">
      <Link to="/view-requests">
        <img src={viewRequestsIcon} alt="View Requests" className="requests-img" />
      </Link>
     
      <Link to="/edit-profile">
        <img src={profileIcon} alt="Edit Profile" className="profile-img" />
      </Link>
      <img
        src={logoutIcon}
        alt="Logout"
        className="logout-img"
        onClick={handleLogout}
        style={{ cursor: "pointer" }}
      />
       <Link to="/">
        <img src={home} alt="Home" className="home-img" />
      </Link>
    </div>
  }
/>
      <main className="bookings-content">
        <div className="all-container">
          <motion.h1
            className="bookings-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Available Booking Days
          </motion.h1>

          <motion.div
            className="calendar-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Calendar
              tileClassName={tileClassName}
              onClickDay={handleDateClick}
              tileDisabled={({ date }) => bookedDates.includes(date.toISOString().split("T")[0])}
              tileContent={({ date }) =>
                bookedDates.includes(date.toISOString().split("T")[0]) ? (
                  <div className="booked-label">Booked</div>
                ) : null
              }
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default AvailableBookings;
