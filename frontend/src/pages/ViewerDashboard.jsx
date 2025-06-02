import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./ViewerDashboard.css";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs,  query,  where} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import myevents from "../assets/view-requests.png";
import logoutIcon from "../assets/logout.png";

const ViewerDashboard = () => {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ top: 0, left: 0 });
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "events");
        const approvedQuery = query(eventsCollection, where("status", "==", "Approved"));

        const querySnapshot = await getDocs(approvedQuery);

        const eventList = {};
        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          if (eventData.eventDate) {
            const formattedDate = eventData.eventDate;
            eventList[formattedDate] = {
              name: eventData.eventName || "Unnamed Event",
              description: eventData.description || "No description provided",
              whyAttend: eventData.whyAttend || "No reason provided",
              guests: eventData.guests || "No guests listed",
            };
          }
        });

        setEvents(eventList);
      } catch (error) {
        console.error("❌ Error fetching approved events:", error);
      }
    };

    fetchEvents();
  }, []);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (!currentUser) {
      navigate("/"); 
    } else {
      setUser(currentUser);
      setAuthChecked(true);
    }
  });
  return () => unsubscribe();
}, []);


  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const formatDate = (date) => date.toISOString().split("T")[0];

  const tileClassName = ({ date }) => {
    const formattedDate = formatDate(date);
    return events[formattedDate] ? "event-day" : "";
  };

  const tileContent = ({ date }) => {
    const formattedDate = formatDate(date);
    const event = events[formattedDate];

    if (!event) return null;

    const handleMouseEnter = (e) => {
      const rect = e.target.getBoundingClientRect();
      setHoveredEvent(event);
      setHoverPosition({
        top: rect.top + window.scrollY - 130,
        left: rect.left + rect.width / 2,
      });
    };

    const handleMouseLeave = () => {
      setHoveredEvent(null);
    };

    return (
      <div
        className="event-marker"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        📍 {event.name}
      </div>
    );
  };

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
          <div className="header-icons">
            {authChecked && user ? (
              <>
                <img
                  src={myevents}
                  alt="My Events"
                  className="header-icon"
                  onClick={() => navigate("/MyEvents")}
                />
                <img
                  src={logoutIcon}
                  alt="Logout"
                  className="header-icon"
                  onClick={handleLogout}
                />
              </>
            ) : null}
            <Link to="/">
              <img src={home} alt="Home" className="home-img" />
            </Link>
          </div>
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
  locale="en-US"
    showNeighboringMonth={true}
          />
        </motion.div>

        {hoveredEvent && (
          <div
            className="floating-event-card"
            style={{
              top: `${hoverPosition.top}px`,
              left: `${hoverPosition.left}px`,
            }}
          >
            <strong>Why Attend:</strong>
            <p>{hoveredEvent.whyAttend}</p>
            <strong>Guests:</strong>
            <p>{hoveredEvent.guests}</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewerDashboard;
