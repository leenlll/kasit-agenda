import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { db, auth } from "../firebaseConfig";
import { updateDoc, setDoc, arrayUnion, collection, query, where, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaClock, FaMapMarkerAlt, FaUsers, FaCalendarAlt } from "react-icons/fa";
import "./EventInfo.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import myevents from "../assets/view-requests.png";
import logoutIcon from "../assets/logout.png";
import { signOut } from "firebase/auth";

const EventInfoPage = () => {

  const [userChecked, setUserChecked] = useState(false);
  const { date } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [user, setUser] = useState(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (!currentUser) {
      navigate("/");
    } else {
      setUser(currentUser);
    }
    setUserChecked(true);
  });

  return () => unsubscribe();
}, []);

  useEffect(() => {
    const fetchEventAndOrganizer = async () => {
      try {
        const q = query(
          collection(db, "events"),
          where("eventDate", "==", date),
          where("status", "==", "Approved")
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const eventDoc = querySnapshot.docs[0];
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
            setEvent(eventData);


          const organizerId = eventData.organizerId;
          if (organizerId) {
            const organizerRef = doc(db, "organizers", organizerId);
            const organizerSnap = await getDoc(organizerRef);
            if (organizerSnap.exists()) {
              setOrganizer(organizerSnap.data());
            }
          }
        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error("Error fetching event/organizer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndOrganizer();
  }, [date]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (!user || !event) return;

      try {
        const studentRef = doc(db, "students", user.uid);
        const studentSnap = await getDoc(studentRef);
        if (studentSnap.exists()) {
          const registeredEvents = studentSnap.data().registeredEvents || [];
          const formattedEvent = `${event.eventName} - ${date}`;
          if (registeredEvents.includes(formattedEvent)) {
            setIsRegistered(true);
          }
        }
      } catch (err) {
        console.error("Registration check failed:", err);
      }
    };

    checkRegistration();
  }, [user, event]);

 const handleRegister = async () => {
  if (!user || !event) {
    alert("❌ You must be signed in to register.");
    return;
  }

  try {
    const studentRef = doc(db, "students", user.uid);
await setDoc(studentRef, {
  registeredEvents: arrayUnion(`${event.eventName} - ${date}`),
}, { merge: true });

    if (event.id) {
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, {
        registeredStudents: arrayUnion({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        }),
      });

      await addDoc(collection(db, "registrations"), {
        eventId: event.id,
        studentName: user.displayName || user.email.split("@")[0],         email: user.email,
      });
    }

    setIsRegistered(true);
    alert("✅ You are now registered for this event.");
  } catch (error) {
    console.error("❌ Registration error:", error);
    alert("Something went wrong.");
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
    <div className="event-page">
      <Background />
<Header
  showAboutUs={false}
  extraRightContent={
    <div className="header-icons">
      {userChecked && user ? (
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
      ) : null}
      <Link to="/">
        <img src={home} alt="Home" className="home-img" />
      </Link>
    </div>
  }
/>



      {event && (
        <motion.div
          className="event-date-banner"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <FaCalendarAlt className="banner-icon" />
          <span className="banner-date">{date}</span>
        </motion.div>
      )}

      <main className="event-content">
        {loading ? (
          <p>Loading event details...</p>
        ) : event ? (
          <motion.div
            className="event-box fade-scroll"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h1 className="event-title hover-glow">
              {event.eventName || "Untitled Event"}
            </h1>
            <div className="title-underline" />
            <p className="event-description">
              {event.description || "No description provided."}
            </p>

            {organizer && (
              <div className="event-organizer-info">
                <p><strong>Organizer:</strong> {organizer.firstName} {organizer.lastName}</p>
                <p><strong>Organization:</strong> {organizer.organization}</p>
                <p><strong>Email:</strong> <a href={`mailto:${organizer.email}`}>{organizer.email}</a></p>
              </div>
            )}

            <div className="event-details">
              <p><FaClock className="event-icon" /> <strong>Time Slot:</strong> {event.timeSlot || "N/A"}</p>
              <p><FaMapMarkerAlt className="event-icon" /> <strong>Location:</strong> {event.location || "Not provided"}</p>
              <p><FaUsers className="event-icon" /> <strong>Guests:</strong> {event.guests?.trim() || "None"}</p>
              {event.targetedStudents && (
                <p><strong>Targeted Students:</strong> {event.targetedStudents}</p>
              )}
              {event.resources && (
                <p><strong>Resources:</strong> {event.resources}</p>
              )}
             
            </div>

            <div className="button-group">
              <button className="event-btn" onClick={() => navigate(-1)}>Back</button>
              <button className="event-btn" onClick={() => navigate(`/add-feedback/${date}`)}>Add Feedback</button>
              <button className="event-btn" onClick={() => { navigator.clipboard.writeText(window.location.href); alert("📎 Link copied to clipboard!"); }}>Share Event</button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="no-event-box"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="no-event">⚠️ No approved event found for this date.</p>
          </motion.div>
        )}
      </main>

      {userChecked ? (
  user ? (
    isRegistered ? (
      <p className="event-btn registered-message">
        ✅ You are already registered for this event.
      </p>
    ) : (
      <button className="event-btn" onClick={handleRegister}>
        Register for This Event
      </button>
    )
  ) : (
    <p className="event-btn warning-message">
      ❌ Please sign in to register for this event.
    </p>
  )
) : null}

    </div>
  );
};

export default EventInfoPage;
