import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import axios from "axios";

import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import logoutIcon from "../assets/logout.png";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const fetchCalled = useRef(false);
  const navigate = useNavigate(); // ✅ needed for redirect after logout

  // ✅ Logout function
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

  // ✅ Fetch event requests from bookings and events
  useEffect(() => {
    if (fetchCalled.current) return;
    fetchCalled.current = true;

    const fetchEvents = async () => {
      try {
        console.log("🔍 Fetching all event requests...");

        // Bookings (Pending/Denied)
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const bookingsList = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Events (Approved)
        const eventsQuery = query(
          collection(db, "events"),
          where("status", "in", ["Approved", "approved"])
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Merge results
        const allRequests = [...bookingsList, ...eventsList];
        console.log("✅ Fetched event requests:", allRequests);
        setEvents(allRequests);
      } catch (error) {
        console.error("❌ Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  // ✅ Handle approval/denial
  const handleStatusUpdate = async (eventId, newStatus, organizerEmail, eventName) => {
    try {
      console.log(`🛠 Updating ${eventId} to ${newStatus}...`);
      const eventRef = doc(db, "bookings", eventId);
      const eventDoc = await getDoc(eventRef);

      if (!eventDoc.exists()) {
        console.error("❌ Event not found.");
        return;
      }

      const eventData = eventDoc.data();

      if (newStatus === "Approved") {
        const newEventRef = doc(db, "events", eventId);
        await setDoc(newEventRef, {
          ...eventData,
          status: "Approved",
        });
        console.log(`✅ Event ${eventId} moved to 'events'`);
      }

      await updateDoc(eventRef, { status: newStatus });
      await sendStatusEmail(organizerEmail, eventName, newStatus);

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, status: newStatus } : event
        )
      );
      console.log(`✅ Status updated to ${newStatus}`);
    } catch (error) {
      console.error(`❌ Error updating status:`, error);
    }
  };

  // ✅ Notify via email
  const sendStatusEmail = async (organizerEmail, eventName, status) => {
    try {
      console.log(`📩 Emailing ${organizerEmail} - ${status}`);
const res = await axios.post("https://kasit-agenda.onrender.com/api/admin/update-booking-status", {
        organizerEmail,
        eventName,
        status,
      });
      console.log("✅ Email sent:", res.data);
    } catch (error) {
      console.error("❌ Email error:", error.response ? error.response.data : error);
    }
  };

  return (
    <div className="admin-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <div className="header-icons">
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

      <main className="admin-content">
        <motion.h1
          className="admin-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Admin Dashboard
        </motion.h1>

        <div className="requests-content">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id}>
                    <td>{event.eventName}</td>
                    <td>{event.eventDate || event.date}</td>
                    <td>{event.description}</td>
                    <td className={`status-${event.status.toLowerCase()}`}>
                      {event.status}
                    </td>
                    <td>
                      {event.status === "Pending" ? (
                        <div>
                          <button
                            className="modify-btn"
                            onClick={() =>
                              handleStatusUpdate(
                                event.id,
                                "Approved",
                                event.organizerEmail,
                                event.eventName
                              )
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="modify-btn deny-btn"
                            onClick={() =>
                              handleStatusUpdate(
                                event.id,
                                "Denied",
                                event.organizerEmail,
                                event.eventName
                              )
                            }
                          >
                            Deny
                          </button>
                        </div>
                      ) : (
                        <span className="status-info">{event.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No event requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
