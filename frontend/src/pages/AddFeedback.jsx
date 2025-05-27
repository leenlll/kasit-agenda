import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { db, auth } from "../firebaseConfig";
import {  collection, query,  where,  getDocs,  addDoc,} from "firebase/firestore";
import { onAuthStateChanged,  signOut} from "firebase/auth";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import logoutIcon from "../assets/logout.png";
import myevents from "../assets/view-requests.png";
import "./AddFeedback.css";

const AddFeedback = () => {
  const { date } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userChecked, setUserChecked] = useState(false);
  const [eventName, setEventName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({
    usefulness: "",
    participationAgain: "",
    duration: "",
    relevance: "",
    preference: "",
    pastParticipation: "",
    futureInterest: "",
    sufficientActivities: "",
    increaseActivities: "",
    suggestions: "",
    trainingSuggestions: "",
  });

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
      setUserChecked(true);
    }
  });

  return () => unsubscribe(); // cleanup when user leaves the page
}, []);

useEffect(() => {
  const fetchEvent = async () => {
    try {
      if (!date) return;

      const eventsCollection = collection(db, "events");
      const q = query(eventsCollection, where("eventDate", "==", date));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const eventData = querySnapshot.docs[0].data();
        setEventName(eventData.eventName || "Unnamed Event");
      } else {
        setEventName("Unknown Event");
      }
    } catch (error) {
      console.error("❌ Error fetching event:", error);
      setEventName("Error loading event");
    } finally {
      setLoading(false);
    }
  };

  fetchEvent();
}, [date]);


  const handleChange = (e) => {
    setFeedback({ ...feedback, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "eventFeedback"), {
        eventDate: date,
        eventName,
        ...feedback
      });
      alert("✅ Feedback submitted successfully!");
      navigate(`/EventInfo/${date}`);
    } catch (error) {
      console.error("❌ Error submitting feedback:", error);
      alert("⚠️ Failed to submit feedback. Please try again.");
    }
  };

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

  return (
    <div className="feedback-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <div className="header-icons">
            {userChecked && user && (
              <>
                <img
                  src={myevents}
                  alt="My Events"
                  className="header-icon"
                  onClick={() => navigate("/MyEvents")}
                />
                <img
                  src={logoutIcon}
                  alt="Logout"
                  className="header-icon"
                  onClick={handleLogout}
                />
              </>
            )}
            <Link to="/">
              <img src={home} alt="Home" className="home-img" />
            </Link>
          </div>
        }
      />

      <div className="feedback-form-container">
        <motion.div
          className="feedback-form-box"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="feedback-title">Event Feedback Form</h1>

          <motion.form onSubmit={handleSubmit} className="feedback-form">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>Evaluation Criteria</th>
                  <th>Excellent</th>
                  <th>Very Good</th>
                  <th>Good</th>
                  <th>Fair</th>
                  <th>Poor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "usefulness", label: "Was the event useful for you?" },
                  { name: "participationAgain", label: "Would you participate in such an event again?" },
                  { name: "duration", label: "Was the event duration appropriate?" },
                  { name: "relevance", label: "How relevant was the event to your studies?" },
                ].map((item) => (
                  <tr key={item.name}>
                    <td>{item.label}</td>
                    {["Excellent", "Very Good", "Good", "Fair", "Poor"].map((value) => (
                      <td key={value}>
                        <input
                          type="radio"
                          name={item.name}
                          value={value}
                          onChange={handleChange}
                          required
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                <tr>
                  <td>Do you prefer curricular or extracurricular activities?</td>
                  <td colSpan="2">
                    <input type="radio" name="preference" value="Curricular" onChange={handleChange} required /> Curricular
                  </td>
                  <td colSpan="3">
                    <input type="radio" name="preference" value="Extracurricular" onChange={handleChange} required /> Extracurricular
                  </td>
                </tr>
                <tr>
                  <td>Have you participated in organizing any event?</td>
                  <td colSpan="2">
                    <input type="radio" name="pastParticipation" value="Yes" onChange={handleChange} required /> Yes
                  </td>
                  <td colSpan="3">
                    <input type="radio" name="pastParticipation" value="No" onChange={handleChange} required /> No
                  </td>
                </tr>
                <tr>
                  <td>Would you like to participate in the future?</td>
                  <td colSpan="2">
                    <input type="radio" name="futureInterest" value="Yes" onChange={handleChange} required /> Yes
                  </td>
                  <td colSpan="3">
                    <input type="radio" name="futureInterest" value="No" onChange={handleChange} required /> No
                  </td>
                </tr>
                <tr>
                  <td>Are the number of events in the college sufficient?</td>
                  <td colSpan="2">
                    <input type="radio" name="sufficientActivities" value="Yes" onChange={handleChange} required /> Yes
                  </td>
                  <td colSpan="3">
                    <input type="radio" name="sufficientActivities" value="No" onChange={handleChange} required /> No
                  </td>
                </tr>
                <tr>
                  <td>Would you like more events in the college?</td>
                  <td colSpan="2">
                    <input type="radio" name="increaseActivities" value="Yes" onChange={handleChange} required /> Yes
                  </td>
                  <td colSpan="3">
                    <input type="radio" name="increaseActivities" value="No" onChange={handleChange} required /> No
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="feedback-suggestions">
              <label>Suggestions to improve such events:</label>
              <textarea
                name="suggestions"
                value={feedback.suggestions}
                onChange={handleChange}
              />

              <label>Suggestions for training programs / activities:</label>
              <textarea
                name="trainingSuggestions"
                value={feedback.trainingSuggestions}
                onChange={handleChange}
              />
            </div>

            <div className="button-group">
              <button type="button" className="submit-button" onClick={() => navigate(-1)}>
                Back
              </button>
              <button type="submit" className="submit-button">
                Submit Feedback
              </button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddFeedback;
