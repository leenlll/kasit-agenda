import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { db, auth } from "../firebaseConfig";
import {  collection,  getDocs,  updateDoc,  doc,  query,  where,  getDoc,  setDoc,} from "firebase/firestore";
import { signOut } from "firebase/auth";
import axios from "axios";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import logoutIcon from "../assets/logout.png";
import logIcon from "../assets/log.png";
import "./AdminDashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [registrationsMap, setRegistrationsMap] = useState({});
  const [selectedEventStudents, setSelectedEventStudents] = useState([]);
  const [selectedEventInfo, setSelectedEventInfo] = useState({});
  const [showModal, setShowModal] = useState(false);
  const fetchCalled = useRef(false);
  const navigate = useNavigate();

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
    if (fetchCalled.current) return;
    fetchCalled.current = true;

    const fetchEvents = async () => {
      try {
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const bookingsList = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const eventsQuery = query(
          collection(db, "events"),
          where("status", "in", ["Approved", "approved"])
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const allRequests = [...bookingsList, ...eventsList];
        setEvents(allRequests);

        const regsSnapshot = await getDocs(collection(db, "registrations"));
        const regsMap = {};

        regsSnapshot.forEach((doc) => {
          const data = doc.data();
          const { eventId, studentName, email } = data;
          if (!regsMap[eventId]) {
            regsMap[eventId] = [];
          }
          regsMap[eventId].push({ studentName, email });
        });

        setRegistrationsMap(regsMap);
      } catch (error) {
        console.error("❌ Error fetching events or registrations:", error);
      }
    };

    fetchEvents();
  }, []);

  const handleStatusUpdate = async (eventId, newStatus, organizerEmail, eventName) => {
    try {
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
      }

      await updateDoc(eventRef, { status: newStatus });
      await sendStatusEmail(organizerEmail, eventName, newStatus);

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, status: newStatus } : event
        )
      );
    } catch (error) {
      console.error(`❌ Error updating status:`, error);
    }
  };
const handleExportPDF = () => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Registered Students", 14, 22);

  const tableData = selectedEventStudents.map((student, index) => [
    index + 1,
    student.studentName,
    student.email,
  ]);

autoTable(doc, {
  head: [["#", "Student Name", "Email"]],
  body: tableData,
  startY: 30,
  styles: { fontSize: 11 },
  headStyles: { fillColor: [62, 62, 166] },
});


  const clean = (str) =>
    str?.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  const filename = selectedEventInfo.eventName
    ? `students_${clean(selectedEventInfo.eventName)}_${selectedEventInfo.eventDate}.pdf`
    : "registered_students.pdf";

  doc.save(filename);
};

  const sendStatusEmail = async (organizerEmail, eventName, status) => {
    try {
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
const handleLog = () => {
  navigate("/admin-logs");
};

  return (
    <div className="admin-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <div className="header-icons">
            <img
              src={logIcon}
              alt="Log"
              className="log-img"
              onClick={handleLog}
              style={{ cursor: "pointer" }}
            />
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
                        <>
<button
  className="report-btn"
  onClick={() => {
    setSelectedEventStudents(registrationsMap[event.id] || []);
    setSelectedEventInfo({
      eventName: event.eventName,
      eventDate: event.eventDate || event.date,
    });
    setShowModal(true);
  }}
>
  View Registered Students
</button>
                           
                        </>
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

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
  <h3>Registered Students</h3>
  {selectedEventStudents.length > 0 ? (
    <ul>
      {selectedEventStudents.map((student, index) => (
        <li key={index}>
          {student.studentName} ({student.email})
        </li>
      ))}
    </ul>
  ) : (
    <p>No students registered for this event.</p>
  )}
  <div className="modal-buttons">
    <button className="close-modal-btn" onClick={handleExportPDF}>
      Download as PDF
    </button>
    <button className="close-modal-btn" onClick={() => setShowModal(false)}>
      Close
    </button>
  </div>
</div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
