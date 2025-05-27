import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../firebaseConfig";
import { useNavigate, Link } from "react-router-dom";
import Background from "../components/Background";
import Header from "../components/Header";
import "./AdminLogs.css";
import logoutIcon from "../assets/logout.png";
import homeIcon from "../assets/home.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const navigate = useNavigate();
  const pdfRef = useRef();

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDownloadPDF = async () => {
  const element = pdfRef.current;

  document.querySelectorAll(".no-print").forEach((el) => {
    el.style.display = "none";
  });

  await new Promise((resolve) => setTimeout(resolve, 500));

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    scrollX: 0,
    scrollY: -window.scrollY,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgProps = pdf.getImageProperties(imgData);
  const imgWidth = pageWidth;
  const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(`admin_logs_${new Date().toISOString().slice(0, 10)}.pdf`);

  document.querySelectorAll(".no-print").forEach((el) => {
    el.style.display = "";
  });
};
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);
      if (!adminSnap.exists()) return;

      try {
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const logsData = [];

        for (const eventDoc of bookingsSnapshot.docs) {
          const data = eventDoc.data();
          const eventName = data.eventName || "Untitled";
          const eventDate = data.eventDate || "Unknown";
          const eventKey = `${eventName} - ${eventDate}`;
          const organizerName = data.organizer || "Unknown";
          const organizerEmail = data.organizerEmail || "N/A";
          const location = data.location || "N/A";
          const time = `${data.timeFrom || ""} - ${data.timeTo || ""}`;
          const status = data.status || "Unknown";
          let timestamp;

          if (data.eventDate && data.timeFrom) {
            const timestampStr = `${data.eventDate}T${data.timeFrom}:00`;
            timestamp = new Date(timestampStr);
          } else {
            timestamp = new Date();
          }

          const registeredStudents = [];
          studentsSnapshot.forEach((studentDoc) => {
            const studentData = studentDoc.data();
            const registeredEvents = studentData.registeredEvents || [];
            if (Array.isArray(registeredEvents) && registeredEvents.includes(eventKey)) {
              const fallbackName =
                studentData.name || studentData.displayName || studentData.email || "Unknown Student";
              registeredStudents.push(fallbackName);
            }
          });

          logsData.push({
            eventName,
            eventDate,
            status,
            organizerName,
            organizerEmail,
            time,
            location,
            registeredStudents,
            timestamp,
          });
        }

        logsData.sort((a, b) => b.timestamp - a.timestamp);
        setLogs(logsData);
      } catch (err) {
        console.error("❌ Firestore fetch error:", err.message);
      }
    });
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.status.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || log.status === statusFilter;

    const logDate = new Date(log.eventDate);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const matchesDate =
      (!fromDate || logDate >= fromDate) && (!toDate || logDate <= toDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="admin-logs-wrapper">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <div className="header-icons">
            <img
              src={logoutIcon}
              alt="Logout"
              className="logout-icon"
              onClick={handleLogout}
            />
            <Link to="/">
              <img src={homeIcon} alt="Home" className="home-img" />
            </Link>
          </div>
        }
      />

      <div className="admin-logs-page" ref={pdfRef}>
        <div className="logs-header no-print">
          <h2>Event Logs</h2>
          <button className="pdf-btn" onClick={handleDownloadPDF}>
            Download PDF
          </button>
        </div>

        <div className="filter-bar no-print">
  <label className="date-filter">
    Search
    <input
      className="search-bar"
      type="text"
      placeholder="Search by event, or organizer"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </label>

  <label className="date-filter">
    Status
    <select
      className="filter-dropdown"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="All">All Statuses</option>
      <option value="Approved">Approved</option>
      <option value="Denied">Denied</option>
      <option value="Pending">Pending</option>
    </select>
  </label>

  <label className="date-filter">
    From:
    <input
      type="date"
      value={dateFrom}
      onChange={(e) => setDateFrom(e.target.value)}
    />
  </label>

  <label className="date-filter">
    To:
    <input
      type="date"
      value={dateTo}
      onChange={(e) => setDateTo(e.target.value)}
    />
  </label>
</div>


        <table className="logs-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Status</th>
              <th>Organizer</th>
              <th>Email</th>
              <th>Time</th>
              <th>Location</th>
              <th>Registered</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.eventName}</td>
                  <td>{log.eventDate}</td>
                  <td>{log.status}</td>
                  <td>{log.organizerName}</td>
                  <td>{log.organizerEmail}</td>
                  <td>{log.time}</td>
                  <td>{log.location}</td>
                  <td>
                    {log.registeredStudents.length > 0 ? (
                      <details>
                        <summary>👁 {log.registeredStudents.length}</summary>
                        <ul className="student-list">
                          {log.registeredStudents.map((name, i) => (
                            <li key={i}>{name}</li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <span>—</span>
                    )}
                  </td>
                  <td>{log.timestamp.toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogs;
