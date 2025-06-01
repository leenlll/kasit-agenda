// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { collection, getDocs,  deleteDoc,  doc,  query,  where,} from "firebase/firestore";
// import { db, auth } from "../firebaseConfig";
// import "./ViewRequests.css";
// import Background from "../components/Background";
// import Header from "../components/Header";
// import home from "../assets/home.png";
// import profileIcon from "../assets/profile.png";
// import logoutIcon from "../assets/logout.png";
// import { signOut } from "firebase/auth";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const ViewRequests = () => {
//   const [requests, setRequests] = useState([]);
//   const [registrationsMap, setRegistrationsMap] = useState({});
//   const [selectedEventStudents, setSelectedEventStudents] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedEventInfo, setSelectedEventInfo] = useState({});
//   const navigate = useNavigate();

//   const handleLogout = async () => {
//     const confirm = window.confirm("Are you sure you want to log out?");
//     if (!confirm) return;
//     try {
//       await signOut(auth);
//       navigate("/");
//     } catch (error) {
//       console.error("❌ Logout failed:", error);
//     }
//   };

//   useEffect(() => {
//     const fetchRequests = async () => {
//       try {
//         const user = auth.currentUser;
//         if (!user) return;

//         const bookingsQuery = query(
//           collection(db, "bookings"),
//           where("organizerId", "==", user.uid)
//         );
//         const bookingsSnapshot = await getDocs(bookingsQuery);
//         const bookingsList = bookingsSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         const eventsQuery = query(
//           collection(db, "events"),
//           where("organizerId", "==", user.uid)
//         );
//         const eventsSnapshot = await getDocs(eventsQuery);
//         const eventsList = eventsSnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//           status: "Approved",
//         }));

//         const allRequests = [...bookingsList, ...eventsList];
//         setRequests(allRequests);

//         const regsSnapshot = await getDocs(collection(db, "registrations"));
//         const regsMap = {};
//         regsSnapshot.forEach((doc) => {
//           const data = doc.data();
//           const { eventId, studentName, email } = data;
//           if (!regsMap[eventId]) regsMap[eventId] = [];
//           regsMap[eventId].push({ studentName, email });
//         });
//         setRegistrationsMap(regsMap);
//       } catch (error) {
//         console.error("❌ Error fetching event requests:", error);
//       }
//     };

//     fetchRequests();
//   }, []);

// const handleExportPDF = () => {
//   const doc = new jsPDF();
//   doc.setFontSize(18);
//   doc.text("Registered Students", 14, 22);

//   const tableData = selectedEventStudents.map((student, index) => [
//     index + 1,
//     student.studentName,
//     student.email,
//   ]);

//   autoTable(doc, {
//     head: [["#", "Student Name", "Email"]],
//     body: tableData,
//     startY: 30,
//     styles: { fontSize: 11 },
//     headStyles: { fillColor: [62, 62, 166] },
//   });

//   const clean = (str) =>
//     str?.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

//   const filename = selectedEventInfo.eventName
//     ? `students_${clean(selectedEventInfo.eventName)}_${selectedEventInfo.eventDate}.pdf`
//     : "registered_students.pdf";

//   doc.save(filename);
// };


//   return (
//     <div className="view-requests-page">
//       <Background />
//       <Header
//         showAboutUs={false}
//         extraRightContent={
//           <div className="header-icons">
//             <Link to="/edit-profile">
//               <img src={profileIcon} alt="Edit Profile" className="profile-img" />
//             </Link>
//             <img
//               src={logoutIcon}
//               alt="Logout"
//               className="logout-img"
//               onClick={handleLogout}
//               style={{ cursor: "pointer" }}
//             />
//             <Link to="/">
//               <img src={home} alt="Home" className="home-img" />
//             </Link>
//           </div>
//         }
//       />

//       <main className="requests-content">
//         <h1 className="requests-title">Your Event Requests</h1>

//         <table className="requests-table">
//           <thead>
//             <tr>
//               <th>Event Name</th>
//               <th>Date</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {requests.length > 0 ? (
//               requests.map((event) => (
//                 <tr key={event.id}>
//                   <td>{event.eventName}</td>
//                   <td>{event.eventDate}</td>
//                   <td className={`status-${event.status.toLowerCase()}`}>{event.status}</td>
//                   <td>
//                     {event.status === "Pending" ? (
//                       <>
//                         <button
//                           className="modify-btn"
//                           onClick={() => navigate(`/modify-request/${event.id}`)}
//                         >
//                           Modify
//                         </button>
//                         <button
//                           className="modify-btn"
//                           onClick={() => {
//                             if (window.confirm("Cancel this booking?")) {
//                               deleteDoc(doc(db, "bookings", event.id));
//                               setRequests((prev) =>
//                                 prev.filter((e) => e.id !== event.id)
//                               );
//                             }
//                           }}
//                         >
//                           Cancel
//                         </button>
//                       </>
//                     ) : event.status === "Denied" ? (
//                       <button
//                         className="modify-btn"
//                         onClick={() => navigate(`/modify-request/${event.id}`)}
//                       >
//                         Resubmit
//                       </button>
//                     ) : (
//                       <>
//                         <button
//                           className="report-btn"
//                           onClick={() =>
//                             navigate(`/feedback-report/${event.eventDate}`, {
//                               state: { eventName: event.eventName },
//                             })
//                           }
//                         >
//                           Get Feedback Report
//                         </button>
//                         <button
//                           className="report-btn"
//                           onClick={() => {
//                             setSelectedEventStudents(registrationsMap[event.id] || []);
//                             setSelectedEventInfo({
//                               eventName: event.eventName,
//                               eventDate: event.eventDate,
//                             });
//                             setShowModal(true);
//                           }}
//                         >
//                           View Registered Students
//                         </button>
//                       </>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="4">No event requests found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>

//         <Link to="/available-bookings" className="back-button">
//           Back
//         </Link>

//         {/* Modal */}
//         {showModal && (
//           <div className="modal-overlay">
//             <div className="modal-content">
//               <h3>Registered Students</h3>
//               {selectedEventStudents.length > 0 ? (
//                 <ul>
//                   {selectedEventStudents.map((student, index) => (
//                     <li key={index}>
//                       {student.studentName} ({student.email})
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p>No students registered for this event.</p>
//               )}
//               <div className="modal-buttons">
//                 <button className="close-modal-btn" onClick={handleExportPDF}>
//                   Download as PDF
//                 </button>
//                 <button className="close-modal-btn" onClick={() => setShowModal(false)}>
//                   Close
//                 </button>
                
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default ViewRequests;
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [registrationsMap, setRegistrationsMap] = useState({});
  const [selectedEventStudents, setSelectedEventStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventInfo, setSelectedEventInfo] = useState({});
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
        const user = auth.currentUser;
        if (!user) return;

        const bookingsQuery = query(
          collection(db, "bookings"),
          where("organizerId", "==", user.uid)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsList = bookingsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const eventsQuery = query(
          collection(db, "events"),
          where("organizerId", "==", user.uid)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          status: "Approved",
        }));

        const allRequests = [...bookingsList, ...eventsList];
        setRequests(allRequests);

        const regsSnapshot = await getDocs(collection(db, "registrations"));
        const regsMap = {};
        regsSnapshot.forEach((doc) => {
          const data = doc.data();
          const { eventId, studentName, email } = data;
          if (!regsMap[eventId]) regsMap[eventId] = [];
          regsMap[eventId].push({ studentName, email });
        });
        setRegistrationsMap(regsMap);
      } catch (error) {
        console.error("❌ Error fetching event requests:", error);
      }
    };

    fetchRequests();
  }, []);

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
              <th>Denial Reason</th> {/* NEW COLUMN */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((event) => (
                <tr key={event.id}>
                  <td>{event.eventName}</td>
                  <td>{event.eventDate}</td>
                  <td className={`status-${event.status.toLowerCase()}`}>
                    {event.status}
                  </td>
                  <td style={{ whiteSpace: "pre-wrap", maxWidth: "250px", color: "#d9534f" }}>
                    {/* Show denial reason only if denied */}
                    {event.status === "Denied" && event.denialReason
                      ? event.denialReason
                      : "-"}
                  </td>
                  <td>
                    {event.status === "Pending" ? (
                      <>
                        <button
                          className="modify-btn"
                          onClick={() => navigate(`/modify-request/${event.id}`)}
                        >
                          Modify
                        </button>
                        <button
                          className="modify-btn"
                          onClick={() => {
                            if (window.confirm("Cancel this booking?")) {
                              deleteDoc(doc(db, "bookings", event.id));
                              setRequests((prev) =>
                                prev.filter((e) => e.id !== event.id)
                              );
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : event.status === "Denied" ? (
                      <button
                        className="modify-btn"
                        onClick={() => navigate(`/modify-request/${event.id}`)}
                      >
                        Resubmit
                      </button>
                    ) : (
                      <>
                        <button
                          className="report-btn"
                          onClick={() =>
                            navigate(`/feedback-report/${event.eventDate}`, {
                              state: { eventName: event.eventName },
                            })
                          }
                        >
                          Get Feedback Report
                        </button>
                        <button
                          className="report-btn"
                          onClick={() => {
                            setSelectedEventStudents(registrationsMap[event.id] || []);
                            setSelectedEventInfo({
                              eventName: event.eventName,
                              eventDate: event.eventDate,
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

        <Link to="/available-bookings" className="back-button">
          Back
        </Link>

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
                <button
                  className="close-modal-btn"
                  onClick={() => setShowModal(false)}
                >
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

export default ViewRequests;
