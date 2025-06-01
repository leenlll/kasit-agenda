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
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
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
  const [toastShown, setToastShown] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/");
      } else {
        setUser(currentUser);
      }
    });

    if (selectedDate && selectedDate < today && !toastShown) {
      toast.error("You can't book for a past date.");
      setToastShown(true);
    }

    return () => unsubscribe();
  }, [selectedDate, toastShown, navigate, today]);

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
    attendees: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "timeFrom" || name === "timeTo") {
      const timeFrom = name === "timeFrom" ? value : formData.timeFrom;
      const timeTo = name === "timeTo" ? value : formData.timeTo;
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

    if (selectedDate < today) {
      toast.error("You can't book for a past date.");
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
      "attendees",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1").trim()} field.`);
        return;
      }
    }

    try {
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

      await addDoc(collection(db, "bookings"), bookingData);

      try {
        await axios.post("http://localhost:3000/api/bookings/book-event", {
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
          

          <motion.form onSubmit={handleSubmit}>
            <label>Activity Type:</label>
            <select name="eventType" value={formData.eventType} onChange={handleChange} required>
              <option value="">Select Activity Type</option>
              <option value="Initiative">Initiative</option>
              <option value="Lecture">Lecture</option>
              <option value="Workshop">Workshop</option>
            </select>

            <label>Activity Name:</label>
            <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} required />

            <label>Organizing Entity:</label>
            <input type="text" name="organizer" value={formData.organizer} onChange={handleChange} required />

            <label>Description & Objectives:</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required />

            <label>Time:</label>
            <div className="time-inputs">
              <input type="time" name="timeFrom" value={formData.timeFrom} onChange={handleChange} required />
              <span> to </span>
              <input type="time" name="timeTo" value={formData.timeTo} onChange={handleChange} required />
            </div>

            {timeError && <p className="error-message">{timeError}</p>}

            <label>Location:</label>
            <select name="location" value={formData.location} onChange={handleChange} required>
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
              <option value="001">Lab 001</option>
              <option value="002">Lab 002</option>
              <option value="101">Lab 101</option>
              <option value="102">Lab 102</option>
              <option value="103">Lab 103</option>
              <option value="104">Lab 104</option>
              <option value="105">Lab 105</option>
              <option value="106">Lab 106</option>
              <option value="107">Lab 107</option>
              <option value="201">Lab 201</option>
              <option value="202">Lab 202</option>
              <option value="203">Lab 203</option>
              <option value="204">Lab 204</option>
              <option value="205">Lab 205</option>
              <option value="206">Lab 206</option>
              <option value="207">Lab 207</option>
              <option value="301">Lab 301</option>
              <option value="302">Lab 302</option>
              <option value="303">Lab 303</option>
              <option value="304">Lab 304</option>
              <option value="305">Lab 305</option>
              <option value="306">Lab 306</option>
              <option value="307">Lab 307</option>
            </select>

            <label>Target Audience:</label>
            <input type="text" name="targetedStudents" value={formData.targetedStudents} onChange={handleChange} required />

            <label>Required Support Services:</label>
            <textarea name="requiredServices" value={formData.requiredServices} onChange={handleChange} />

            <label>Activity Supervisor:</label>
            <input type="text" name="supervisorName" value={formData.supervisorName} onChange={handleChange} required />

            <label>Supervisor Contact Number:</label>
            <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />

            <label>Guests / Invitees:</label>
            <input type="text" name="guests" value={formData.guests} onChange={handleChange} />

            <label>Why Should Students Attend?</label>
            <textarea name="whyAttend" value={formData.whyAttend} onChange={handleChange} />

            <label>Max Number of attendees:</label>
            <select name="attendees" value={formData.attendees} onChange={handleChange} required>
              <option value="">Select Number</option>
              <option value="0-40">0-40 Lecture Halls/ Labs</option>
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
