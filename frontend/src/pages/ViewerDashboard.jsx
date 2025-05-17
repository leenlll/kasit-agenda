 import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ViewerDashboard.css";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";

const ViewerDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const navigate = useNavigate();

  //  Fetch approved events from Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("🔍 Fetching approved events...");

        const eventsCollection = collection(db, "events");
        const approvedQuery = query(eventsCollection, where("status", "==", "Approved"));

        const querySnapshot = await getDocs(approvedQuery);
        if (querySnapshot.empty) {
          console.warn("⚠️ No approved events found.");
        }

        const eventList = {};
        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          console.log("📌 Firestore Event Data:", eventData);

          // Use eventDate instead of date
          if (eventData.eventDate) {
            const formattedDate = eventData.eventDate; // Firestore stores it as "YYYY-MM-DD"
            eventList[formattedDate] = {
              name: eventData.eventName || "Unnamed Event",
              description: eventData.description || "No description provided",
            };
          } else {
            console.warn("⚠️ Skipping event with missing eventDate:", eventData);
          }
        });

        setEvents(eventList);
        console.log("✅ Approved Events Fetched:", eventList);
      } catch (error) {
        console.error("❌ Error fetching approved events:", error);
      }
    };

    fetchEvents();
  }, []);

  //  Fix: Ensure date format consistency
  const formatDate = (date) => date.toISOString().split("T")[0]; // Ensure "YYYY-MM-DD" format

  // Assign CSS classes based on event presence
  const tileClassName = ({ date }) => {
    const formattedDate = formatDate(date);
    return events[formattedDate] ? "event-day" : "";
  };

  //  Debugging: Log calendar tile checks
  const tileContent = ({ date }) => {
    const formattedDate = formatDate(date);
    console.log("📅 Checking date:", formattedDate, " → Event exists?", events[formattedDate]);

    return events[formattedDate] ? (
      <div className="event-marker">📍 {events[formattedDate].name}</div>
    ) : null;
  };

  // Handle clicking on a date with an event
  const handleDateClick = (value) => {
    const formattedDate = formatDate(value);
    if (events[formattedDate]) {
navigate(`/EventInfo/${formattedDate}`);
    }
  };

  return (
    <div className="viewer-page">
      <Background />

      <Header
        showAboutUs={false}
        extraRightContent={
          <Link to="/">
            <img src={home} alt="Home" className="home-img" />
          </Link>
        }
      />

      <main className="viewer-content">
        <motion.h1
          className="viewer-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Viewer Dashboard
        </motion.h1>

        <motion.div
          className="calendar-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Calendar
            onChange={setDate}
            value={date}
            onClickDay={handleDateClick}
            tileClassName={tileClassName} 
            tileContent={tileContent}
          />
        </motion.div>
      </main>
    </div>
  );
};

export default ViewerDashboard;