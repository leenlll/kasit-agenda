import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./ModifyRequest.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import viewRequestsIcon from "../assets/view-requests.png";


const ModifyRequest = () => {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
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
    const fetchEvent = async () => {
      try {
        if (!bookingId) return;

        const eventRef = doc(db, "bookings", bookingId);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [bookingId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventRef = doc(db, "bookings", event.id);
      await updateDoc(eventRef, { ...event });
      alert("✅ Booking updated successfully!");
      navigate("/view-requests");
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("⚠️ Failed to update booking.");
    }
  };

  if (loading) return <h1>Loading...</h1>;
  if (!event) return <h1>❌ Booking Not Found</h1>;

  return (
    <div className="modify-request-page">
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

      <motion.div
        className="modify-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="modify-title">Modify Booking Details</h1>

        <form onSubmit={handleSubmit} className="modify-form">
          <label>Event Name:</label>
          <input type="text" name="eventName" value={event.eventName || ""} onChange={handleChange} required />

          <label>Date:</label>
          <input type="date" name="eventDate" value={event.eventDate || ""} onChange={handleChange} required />

          <label>Description:</label>
          <textarea name="description" value={event.description || ""} onChange={handleChange} required />

          <label>Time:</label>
          <div className="time-inputs">
            <input type="time" name="timeFrom" value={event.timeFrom || ""} onChange={handleChange} required />
            <span className="to-text">to</span>
            <input type="time" name="timeTo" value={event.timeTo || ""} onChange={handleChange} required />
          </div>

          <label>Location:</label>
          <select name="location" value={event.location || ""} onChange={handleChange} required>
            <option value="">Select Location</option>
            <option value="Hall A">Hall A</option>
            <option value="Hall B">Hall B</option>
            <option value="Outdoor Area">Outdoor Area</option>
            <option value="Main Auditorium">Main Auditorium</option>
          </select>

          <label>Target Audience:</label>
          <input type="text" name="targetedStudents" value={event.targetedStudents || ""} onChange={handleChange} required />

          <label>Required Support Services:</label>
          <textarea name="requiredServices" value={event.requiredServices || ""} onChange={handleChange} required />

          <label>Activity Supervisor (Faculty/Staff):</label>
          <input type="text" name="supervisorName" value={event.supervisorName || ""} onChange={handleChange} required />

          <label>Supervisor Contact Number:</label>
          <input type="tel" name="phoneNumber" value={event.phoneNumber || ""} onChange={handleChange} required />

          <div className="button-group">
            <Link to="/view-requests" className="back-button">Back</Link>
            <button type="submit" className="submit-button">Submit</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ModifyRequest;
