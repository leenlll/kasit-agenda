import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import "./ModifyRequest.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import viewRequestsIcon from "../assets/view-requests.png";
import { toast } from "react-toastify";
import axios from "axios";

const ModifyRequest = () => {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeError, setTimeError] = useState("");

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
    const updated = { ...event, [name]: value };

    if (name === "timeFrom" || name === "timeTo") {
      if (updated.timeFrom && updated.timeTo && updated.timeFrom >= updated.timeTo) {
        setTimeError("End time cannot be earlier than or equal to the start time.");
      } else {
        setTimeError("");
      }
    }

    setEvent(updated);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (timeError) {
    toast.error(timeError);
    return;
  }

  try {
    const eventRef = doc(db, "bookings", event.id);
    await updateDoc(eventRef, { ...event });

    // ✅ Send email to admin after update
    try {
      await axios.post("https://kasit-agenda.onrender.com/api/bookings/modify-event", {
        organizerEmail: event.organizerEmail,
        organizerName: event.organizer,
        eventName: event.eventName,
        eventDate: event.eventDate,
        timeFrom: event.timeFrom,
        timeTo: event.timeTo,
        location: event.location,
        description: event.description,
      });
      console.log("✅ Modification email sent to admin");
    } catch (emailError) {
      console.error("❌ Email error:", emailError);
      toast.warning("Update saved, but email failed to send.");
    }

    toast.success("✅ Booking updated successfully!");
    navigate("/view-requests");
  } catch (error) {
    console.error("Error updating booking:", error);
    toast.error("⚠️ Failed to update booking.");
  }
};


  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
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
            <Link to="/edit-profile">
              <img src={profileIcon} alt="Profile" className="profile-icon" />
            </Link>
            <img
              src={logoutIcon}
              alt="Logout"
              className="logout-icon"
              onClick={handleLogout}
            />
            <Link to="/view-requests">
              <img src={viewRequestsIcon} alt="View Requests" className="requests-img" />
            </Link>
            <Link to="/">
              <img src={home} alt="Home" className="home-img" />
            </Link>
          </div>
        }
      />

      <div className="modify-form-container">
        <motion.div
          className="modify-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="modify-title">Modify Booking Details</h1>

          <motion.form onSubmit={handleSubmit} className="modify-form">
            <label>Activity Name:</label>
            <input type="text" name="eventName" value={event.eventName || ""} onChange={handleChange} required />

            <label>Date:</label>
            <input type="date" name="eventDate" value={event.eventDate || ""} onChange={handleChange} required />

            <label>Description & Objectives:</label>
            <textarea name="description" value={event.description || ""} onChange={handleChange} required />

            <label>Time:</label>
            <div className="time-inputs">
              <input type="time" name="timeFrom" value={event.timeFrom || ""} onChange={handleChange} required />
              <span className="to-text">to</span>
              <input type="time" name="timeTo" value={event.timeTo || ""} onChange={handleChange} required />
            </div>

            {timeError && <p className="error-message">{timeError}</p>}

            <label>Location:</label>
            <select name="location" value={event.location || ""} onChange={handleChange} required>
              <option value="">Select Location</option>
              <option value="Al-Louzy Auditorium">Al-Louzy Auditorium</option>
              <option value="Ground Floor">Ground Floor</option>
              <option value="101">Lecture Hall 101</option>
              <option value="102">Lecture Hall 102</option>
              <option value="103">Lecture Hall 103</option>
              <option value="104">Lecture Hall 104</option>
              <option value="105">Lecture Hall 105</option>
              <option value="201">Lecture Hall 201</option>
              <option value="202">Lecture Hall 202</option>
              <option value="203">Lecture Hall 203</option>
              <option value="204">Lecture Hall 204</option>
              <option value="205">Lecture Hall 205</option>
              <option value="301">Lecture Hall 301</option>
              <option value="302">Lecture Hall 302</option>
              <option value="303">Lecture Hall 303</option>
            </select>

            <label>Target Audience:</label>
            <input type="text" name="targetedStudents" value={event.targetedStudents || ""} onChange={handleChange} required />

            <label>Required Support Services:</label>
            <textarea name="requiredServices" value={event.requiredServices || ""} onChange={handleChange} />

            <label>Activity Supervisor:</label>
            <input type="text" name="supervisorName" value={event.supervisorName || ""} onChange={handleChange} required />

            <label>Supervisor Contact Number:</label>
            <input type="tel" name="phoneNumber" value={event.phoneNumber || ""} onChange={handleChange} required />

            <label>Guests / Invitees:</label>
            <input type="text" name="guests" value={event.guests || ""} onChange={handleChange} />

            <label>Why Should Students Attend?</label>
            <textarea name="whyAttend" value={event.whyAttend || ""} onChange={handleChange} />

            <label>Max Number of attendees:</label>
            <select name="no. of attendees" value={event["no. of attendees"] || ""} onChange={handleChange} required>
              <option value="">Select Number</option>
              <option value="0-40">0-40 Lecture Halls</option>
              <option value="40-200">40-200 Al-Louzy Auditorium</option>
            </select>

            <div className="button-group">
              <button type="button" className="button" onClick={() => navigate(-1)}>
                Back
              </button>
              <button type="submit" className="button">
                Submit
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default ModifyRequest;
