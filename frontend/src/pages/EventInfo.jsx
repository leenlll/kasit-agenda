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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const q = query(
          collection(db, "events"),
          where("status", "==", "Approved")
        );
        const snapshot = await getDocs(q);
        const eventMap = {};

        snapshot.forEach((doc) => {
          const data = doc.data();
          const dateKey = data.eventDate;
          if (!eventMap[dateKey]) eventMap[dateKey] = [];
          eventMap[dateKey].push({
            name: data.eventName,
            description: data.description,
            guests: data.guests || "TBA",
            whyAttend: data.whyAttend || "Join us for something special!",
          });
        });

        setEvents(eventMap);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (date) => date.toISOString().split("T")[0];

  const getDaysLeft = (eventDate) => {
    const today = new Date();
    const target = new Date(eventDate);
    const diff = target - today;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const tileClassName = ({ date }) =>
    events[formatDate(date)] ? "event-day" : "";

  const tileContent = ({ date }) => {
    const dateKey = formatDate(date);
    const dayEvents = events[dateKey];

    if (!dayEvents) return null;

    return (
      <div className="calendar-event-wrapper">
        {dayEvents.map((event, idx) => (
          <div className="simple-flip-card" key={idx}>
            <div className="flip-inner">
              <div className="flip-front">
                📍 {event.name}
              </div>
              <div className="flip-back">
                <p><strong>💡</strong> {event.whyAttend}</p>
                <p><strong>👥</strong> {event.guests}</p>
                <p><strong>⏳</strong> {getDaysLeft(dateKey)}d</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const handleDateClick = (value) => {
    const formatted = formatDate(value);
    if (events[formatted]) {
      navigate(`/EventInfo/${formatted}`);
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
