import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import "./ViewRequests.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import { signOut } from "firebase/auth";


const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
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
    const fetchRequests = async () => {
      try {
        console.log("🔍 Fetching event requests...");
        const user = auth.currentUser;
        if (!user) {
          console.error("❌ No logged-in user!");
          return;
        }

        const bookingsQuery = query(collection(db, "bookings"), where("organizerId", "==", user.uid));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsList = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const eventsQuery = query(collection(db, "events"), where("organizerId", "==", user.uid));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status: "Approved",
        }));

        const allRequests = [...bookingsList, ...eventsList];
        setRequests(allRequests);
        console.log("✅ Organizer's Requests:", allRequests);
      } catch (error) {
        console.error("❌ Error fetching event requests:", error);
      }
    };

    fetchRequests();
  }, []);

  const handleCancelBooking = async (eventId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to cancel this booking?");
      if (!confirmDelete) return;

      await deleteDoc(doc(db, "bookings", eventId));
      setRequests((prev) => prev.filter((event) => event.id !== eventId));
      console.log(`✅ Booking canceled: ${eventId}`);
    } catch (error) {
      console.error("❌ Error canceling booking:", error);
    }
  };

  const handleGetFeedbackReport = (eventDate, eventName) => {
    navigate(`/feedback-report/${eventDate}`, { state: { eventName } });
  };

  return (
    <div className="view-requests-page">
      <Background />
      <Header
       showAboutUs={false}
       extraRightContent={
         <div className="header-icons">
           
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

      <main className="requests-content">
        <h1 className="requests-title">Your Event Requests</h1>

        <table className="requests-table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((event) => (
                <tr key={event.id}>
                  <td>{event.eventName}</td>
                  <td>{event.eventDate}</td>
                  <td className={`status-${event.status.toLowerCase()}`}>{event.status}</td>
                  <td>
                    {event.status === "Pending" ? (
                      <>
                        <button className="modify-btn" onClick={() => navigate(`/modify-request/${event.id}`)}>Modify</button>
                        <button className="modify-btn" onClick={() => handleCancelBooking(event.id)}>Cancel</button>
                      </>
                    ) : event.status === "Denied" ? (
                      <button className="modify-btn" onClick={() => navigate(`/modify-request/${event.id}`)}>Resubmit</button>
                    ) : (
                      <>
                        <button className="report-btn" onClick={() => handleGetFeedbackReport(event.eventDate, event.eventName)}>
                          📄 Get Feedback Report
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No event requests found</td>
              </tr>
            )}
          </tbody>
        </table>

        <Link to="/available-bookings" className="back-button">Back</Link>
      </main>
    </div>
  );
};

export default ViewRequests;
