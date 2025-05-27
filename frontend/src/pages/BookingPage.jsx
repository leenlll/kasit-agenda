
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./BookingPage.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import viewRequestsIcon from "../assets/view-requests.png";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";  // <-- added query, where, getDocs
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import { signOut } from "firebase/auth";
import axios from "axios";

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDate = new URLSearchParams(location.search).get("date");

  const [user, setUser] = useState(auth.currentUser);
  const [timeError, setTimeError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    eventType: "",
    eventName: "",
    organizer: "",
    description: "",
    timeFrom: "",
    timeTo: "",
    location: "",
    targetedStudents: "",
    requiredServices: "",
    supervisorName: "",
    phoneNumber: "",
    guests: "",
    whyAttend: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "timeFrom" || name === "timeTo") {
      const { timeFrom, timeTo } = { ...formData, [name]: value };
      if (timeFrom && timeTo) {
        if (timeFrom >= timeTo) {
          setTimeError("End time cannot be earlier than or equal to the start time.");
        } else {
          setTimeError("");
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in first!");
      return;
    }

    if (timeError) {
      toast.error(timeError);
      return;
    }

    const requiredFields = [
      "eventType",
      "eventName",
      "organizer",
      "description",
      "timeFrom",
      "timeTo",
      "location",
      "targetedStudents",
      "supervisorName",
      "phoneNumber",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1").trim()} field.`);
        return;
      }
    }

    try {
      // **Check if user already submitted an event on this date**
      const bookingsRef = collection(db, "bookings");
      const q = query(
        bookingsRef,
        where("organizerId", "==", user.uid),
        where("eventDate", "==", selectedDate)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("You have already submitted an event for this date.");
        return;
      }

      const bookingData = {
        ...formData,
        eventDate: selectedDate,
        organizerEmail: user.email,
        organizerId: user.uid,
        status: "Pending",
      };

      // Save booking to Firestore
      await addDoc(collection(db, "bookings"), bookingData);

      try {
        await axios.post("https://kasit-agenda.onrender.com/api/bookings/book-event", {
          organizerEmail: user.email,
          organizerName: formData.organizer,
          eventName: formData.eventName,
          eventDate: selectedDate,
          timeFrom: formData.timeFrom,
          timeTo: formData.timeTo,
          location: formData.location,
          description: formData.description,
        });
        console.log("✅ Email sent to admin and organizer");
      } catch (emailError) {
        console.error("❌ Email failed:", emailError);
        toast.warning("Booking saved, but email could not be sent.");
      }

      toast.success("Booking submitted successfully!");
      setTimeout(() => navigate("/view-requests"), 2000);
    } catch (error) {
      console.error("❌ Firestore Error:", error);
      toast.error("Failed to submit booking. Please try again.");
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

  return (
    <div className="booking-page">
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

      <div className="booking-form">
        <motion.div
          className="booking-container"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="booking-title">Activity Request Form</h1>
          <p className="selected-date">
            Booking for: <strong>{selectedDate || "No Date Selected"}</strong>
          </p>

          <motion.form onSubmit={handleSubmit}>
            <label>Activity Type:</label>
            <select name="eventType" onChange={handleChange} required>
              <option value="">Select Activity Type</option>
              <option value="Initiative">Initiative</option>
              <option value="Lecture">Lecture</option>
              <option value="Workshop">Workshop</option>
            </select>

            <label>Activity Name:</label>
            <input type="text" name="eventName" onChange={handleChange} required />

            <label>Organizing Entity:</label>
            <input type="text" name="organizer" onChange={handleChange} required />

            <label>Description & Objectives:</label>
            <textarea name="description" onChange={handleChange} required />

            <label>Time:</label>
            <div className="time-inputs">
              <input type="time" name="timeFrom" onChange={handleChange} required />
              <span> to </span>
              <input type="time" name="timeTo" onChange={handleChange} required />
            </div>

            {timeError && <p className="error-message">{timeError}</p>}

            <label>Location:</label>
            <select name="location" onChange={handleChange} required>
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
            <input type="text" name="targetedStudents" onChange={handleChange} required />

            <label>Required Support Services:</label>
            <textarea name="requiredServices" onChange={handleChange} />

            <label>Activity Supervisor:</label>
            <input type="text" name="supervisorName" onChange={handleChange} required />

            <label>Supervisor Contact Number:</label>
            <input type="tel" name="phoneNumber" onChange={handleChange} required />

            <label>Guests / Invitees:</label>
            <input type="text" name="guests" onChange={handleChange} />

            <label>Why Should Students Attend?</label>
            <textarea name="whyAttend" onChange={handleChange} />

            <label>Max Number of attendees:</label>
            <select name="no. of attendees" onChange={handleChange} required>
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

export default BookingPage;
