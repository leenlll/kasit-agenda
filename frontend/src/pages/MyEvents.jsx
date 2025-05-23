import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import Background from "../components/Background";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import home from "../assets/home.png";
import "./MyEvents.css";

const MyEvents = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user) return;
      try {
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          setRegisteredEvents(studentSnap.data().registeredEvents || []);
        }
      } catch (err) {
        console.error("Error fetching registered events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, [user]);

  return (
    <div className="my-events-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <Link to="/">
            <img src={home} alt="Home" className="home-img" />
          </Link>
        }
      />

      <div className="my-events-content">
        <h1>📅 My Registered Events</h1>
        {loading ? (
          <p>Loading...</p>
        ) : registeredEvents.length > 0 ? (
          <ul className="event-list">
            {registeredEvents.map((event, index) => (
              <li key={index} className="event-item">
                {event}
              </li>
            ))}
          </ul>
        ) : (
          <p>You haven't registered for any events yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
