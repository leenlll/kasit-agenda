import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import logoutIcon from "../assets/logout.png";
import "./MyEvents.css";

const MyEvents = () => {
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!user) return;
      try {
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const rawEvents = studentSnap.data().registeredEvents || [];
          setRegisteredEvents(rawEvents);
        }
      } catch (err) {
        console.error("Error fetching registered events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, [user]);

  const handleCancel = async (eventStr) => {
    const [name, date] = eventStr.split(" - ");
    const confirmed = window.confirm(
      `Cancel registration for "${name}" on ${date}?`
    );
    if (!confirmed) return;

    try {
      const studentRef = doc(db, "students", user.uid);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const currentEvents = studentSnap.data().registeredEvents || [];
        const updatedEvents = currentEvents.filter((e) => e !== eventStr);

        // Update student document
        await updateDoc(studentRef, { registeredEvents: updatedEvents });

        // Find and update event document
        const eventsQuery = query(
          collection(db, "events"),
          where("eventDate", "==", new Date(date))
        );
        const querySnapshot = await getDocs(eventsQuery);

        for (const docSnap of querySnapshot.docs) {
          const eventRef = doc(db, "events", docSnap.id);
          const currentIds = docSnap.data().registeredUserIds || [];
          const updatedIds = currentIds.filter((id) => id !== user.uid);
          await updateDoc(eventRef, { registeredUserIds: updatedIds });
        }

        setRegisteredEvents(updatedEvents);
      }
    } catch (err) {
      console.error("❌ Failed to cancel registration:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="my-events-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <div className="header-icons">
            <img
              src={logoutIcon}
              alt="Logout"
              className="header-icon"
              onClick={handleLogout}
            />
            <Link to="/">
              <img src={home} alt="Home" className="home-img" />
            </Link>
          </div>
        }
      />

      <div className="my-events-container">
        <h2 className="page-title">My Registered Events</h2>

        {loading ? (
          <p className="loading-text">Loading...</p>
        ) : registeredEvents.length > 0 ? (
          <ul className="event-list">
            {registeredEvents.map((eventStr, index) => {
              const [name, date] = eventStr.split(" - ");
              return (
                <li key={index} className="event-item">
                  <div className="event-details">
                    <span className="event-name">{name}</span>
                    <span className="event-date">{date}</span>
                  </div>
                  <div className="event-actions">
                    <Link to={`/event-info/${date}`} className="event-info-link">
                      <span>ℹ</span> Info
                    </Link>
                    <button
                      className="event-actions"
                      onClick={() => handleCancel(eventStr)}
                    >
                      Cancel
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="no-events">
            You haven't registered for any events yet.
          </p>
        )}
        <button onClick={() => window.history.back()} className="back">
          Back
        </button>
      </div>
    </div>
  );
};

export default MyEvents;
