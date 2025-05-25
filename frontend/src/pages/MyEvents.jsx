import React, { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
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
      setUser(currentUser);
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
  {registeredEvents.map((event, index) => {
    const [name, date] = event.split(" - ");
    return (
      <li key={index} className="event-item">
        <div className="event-details">
          <span className="event-name">{name}</span>
          <span className="event-date">{date}</span>
        </div>
        <Link to={`/event-info/${date}`} className="event-info-link">
          <span>ℹ</span> Info
        </Link>
      </li>
    );
  })}
</ul>

        ) : (
          <p className="no-events">You haven't registered for any events yet.</p>
        )}
              <button onClick={() => window.history.back()} className="back"> Back </button>

      </div>
    </div>
  );
};

export default MyEvents;
