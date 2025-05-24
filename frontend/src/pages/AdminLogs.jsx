import React, { useEffect, useState } from "react";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import "./AdminLogs.css";

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      const eventsSnapshot = await getDocs(collection(db, "events"));
      const studentsSnapshot = await getDocs(collection(db, "students"));
      const logsData = [];

      for (const eventDoc of eventsSnapshot.docs) {
        const data = eventDoc.data();
        const eventName = data.eventName || "Untitled";
        const eventDate = data.eventDate || "Unknown";
        const eventKey = `${eventName} - ${eventDate}`;
        let organizerName = data.organizer || "Unknown";
        let organizerEmail = data.organizerEmail || "N/A";
        let registeredStudents = [];

        // Get full organizer name and email
        if (data.organizerId) {
          const orgSnap = await getDoc(doc(db, "organizers", data.organizerId));
          if (orgSnap.exists()) {
            const orgData = orgSnap.data();
            organizerName = `${orgData.firstName} ${orgData.lastName}`;
            organizerEmail = orgData.email || organizerEmail;
          }
        }

        // Check for registered students
        studentsSnapshot.forEach((studentDoc) => {
          const studentData = studentDoc.data();
          const registeredEvents = studentData.registeredEvents || [];
          if (Array.isArray(registeredEvents) && registeredEvents.includes(eventKey)) {
            registeredStudents.push(studentData.name);
          }
        });

        logsData.push({
          id: eventDoc.id,
          eventName,
          eventDate,
          status: data.status || "Unknown",
          organizerName,
          organizerEmail,
          time: `${data.timeFrom || ""} - ${data.timeTo || ""}`,
          location: data.location || "",
          timestamp: data.timestamp?.toDate() || new Date(),
          registeredStudents,
        });
      }

      logsData.sort((a, b) => b.timestamp - a.timestamp);
      setLogs(logsData);
    };

    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.status.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || log.status === statusFilter;

    const eventDate = new Date(log.eventDate);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo) : null;

    const matchesDate =
      (!fromDate || eventDate >= fromDate) &&
      (!toDate || eventDate <= toDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="admin-logs-wrapper">
      <Background />
      <Header />

      <div className="admin-logs-page">
        <div className="logs-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            Back
          </button>
          <h2>Event Logs</h2>
        </div>

        <div className="filter-bar">
          <input
            className="search-bar"
            type="text"
            placeholder="Search by event, organizer, or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="filter-dropdown"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Requested">Requested</option>
            <option value="Denied">Denied</option>
          </select>

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
            {filteredLogs.map((log, index) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogs;
