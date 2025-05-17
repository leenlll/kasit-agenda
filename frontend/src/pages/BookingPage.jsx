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
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import { signOut } from "firebase/auth";


const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;
  
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };
  
  const selectedDate = new URLSearchParams(location.search).get("date");

  const [user, setUser] = useState(auth.currentUser);

  // ✅ Fix memory leak by cleaning up onAuthStateChanged listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
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

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("⚠️ Please sign in first!");
      return;
    }

    // ✅ Ensure all required fields are filled
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
        toast.error(`⚠️ Please fill in the ${field.replace(/([A-Z])/g, " $1").trim()} field.`);
        return;
      }
    }

    try {
      const bookingData = {
        ...formData,
        eventDate: selectedDate,
        organizerEmail: user.email,
        organizerId: user.uid,
        status: "Pending",
      };

      console.log("📤 Saving booking to Firestore:", bookingData);

      const docRef = await addDoc(collection(db, "bookings"), bookingData);
      console.log("✅ Booking saved with ID:", docRef.id);

      await sendBookingEmail(bookingData);
      toast.success("Booking submitted successfully!");
      setTimeout(() => navigate("/view-requests"), 2000);
    } catch (error) {
      console.error("❌ Firestore Error:", error);
      toast.error("⚠️ Failed to submit booking. Please try again.");
    }
  };

  // ✅ Send Email Notification to Admins
  const sendBookingEmail = async (bookingData) => {
    try {
      console.log("📨 Sending booking request:", bookingData);
  
      const emailData = {
        organizerEmail: bookingData.organizerEmail,
        eventName: bookingData.eventName,
        eventDate: bookingData.eventDate,
        timeFrom: bookingData.timeFrom,
        timeTo: bookingData.timeTo,
        location: bookingData.location, // ✅ Location instead of place
        description: bookingData.description,
      };
  
      const response = await axios.post("http://localhost:3000/api/bookings/book-event", emailData);
      console.log("✅ Admins notified via email!", response.data);
    } catch (error) {
      console.error("❌ Error sending email:", error.response ? error.response.data : error);
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
              <option value="Training Course">Training Course</option>
              <option value="Workshop">Workshop</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Competition">Competition</option>
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

            <label>Location:</label>
            <select name="location" onChange={handleChange} required>
              <option value="">Select Location</option>
              <option value="Hall A">Hall A</option>
              <option value="Hall B">Hall B</option>
              <option value="Outdoor Area">Outdoor Area</option>
              <option value="Main Auditorium">Main Auditorium</option>
            </select>

            <label>Target Audience:</label>
            <input type="text" name="targetedStudents" onChange={handleChange} required />

            <label>Required Support Services:</label>
            <textarea name="requiredServices" onChange={handleChange} required />

            <label>Activity Supervisor (Faculty/Staff):</label>
            <input type="text" name="supervisorName" onChange={handleChange} required />

            <label>Supervisor Contact Number:</label>
            <input type="tel" name="phoneNumber" onChange={handleChange} required />

          <label>Guests / Invitees:</label>
<input type="text"   name="guests"   onChange={handleChange} /> 

<label>Why Should Students Attend?</label>
<textarea  name="whyAttend" onChange={handleChange} />

            <div className="button-group">
  <button type="button" className="submit-button" onClick={() => navigate(-1)}>
    Back
  </button>
  <button type="submit" className="submit-button">
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
