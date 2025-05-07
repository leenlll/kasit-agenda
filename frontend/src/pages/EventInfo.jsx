import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import "./EventInfo.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";

const EventInfoPage = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log(`🔍 Fetching event details for date: ${date}`);
        if (!date) return;

        const eventsCollection = collection(db, "events");
        const q = query(eventsCollection, where("eventDate", "==", date), where("status", "==", "Approved"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setEvent(querySnapshot.docs[0].data());
          console.log("✅ Event Found:", querySnapshot.docs[0].data());
        } else {
          console.warn("⚠️ No approved event found in Firestore for this date.");
          setEvent(null);
        }
      } catch (error) {
        console.error("❌ Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [date]);

  return (
    <div className="event-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <Link to="/">
            <img src={home} alt="Home" className="home-img" />
          </Link>
        }
      />

      <main className="event-content">
        {loading ? (
          <p>Loading event details...</p>
        ) : event ? (
          <>
            <motion.div
              className="event-box"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.h1
                className="event-title"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Event Details
              </motion.h1>
              <p><strong>Name:</strong> {event.eventName || "No event name provided"}</p>
              <p><strong>Description:</strong> {event.description || "No description available"}</p>
              <p><strong>Time:</strong> {event.timeFrom} - {event.timeTo || "Not specified"}</p>
              <p><strong>Location:</strong> {event.location || "Not provided"}</p>
              <p><strong>Guests:</strong> {event.guests?.trim() ? event.guests : "None"}</p>
              <div className="button-group">
              <button type="button" className="go-back-btn" onClick={() => navigate(-1)}>Back</button>
              </div>
            </motion.div>

            
            {/* 📌 Add Feedback Button */}
            <button className="add-feedback-btn" onClick={() => navigate(`/add-feedback/${date}`)}>
              ➕ Add Feedback
            </button>
          </>
        ) : (
          <motion.p className="no-event" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            No approved event found for this date.
          </motion.p>
        )}
      </main>
    </div>
  );
};

export default EventInfoPage;
