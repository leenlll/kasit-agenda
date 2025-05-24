import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "./FeedbackReport.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import profileIcon from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";
import viewRequestsIcon from "../assets/view-requests.png";
import { signOut } from "firebase/auth";

const colorMap = {
  Excellent: "#4caf50",
  "Very Good": "#2196f3",
  Good: "#ffc107",
  Fair: "#ff9800",
  Poor: "#f44336",
};

const questions = [
  { key: "usefulness", label: "Was the event useful?" },
  { key: "participationAgain", label: "Would you participate again?" },
  { key: "duration", label: "Was the event duration appropriate?" },
  { key: "relevance", label: "Relevance to your studies" },
];

const binaryQuestions = [
  { key: "pastParticipation", label: "Have you participated in organizing any event?" },
  { key: "futureInterest", label: "Would you like to participate in the future?" },
  { key: "sufficientActivities", label: "Are the number of events in the college sufficient?" },
  { key: "increaseActivities", label: "Would you like more events in the college?" },
];

const FeedbackReport = () => {
  const { date } = useParams();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [eventName, setEventName] = useState("");
  const reportRef = useRef();

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
    const fetchData = async () => {
      const feedbackSnap = await getDocs(
        query(collection(db, "eventFeedback"), where("eventDate", "==", date))
      );
      setFeedbacks(feedbackSnap.docs.map((doc) => doc.data()));

      const eventSnap = await getDocs(
        query(collection(db, "events"), where("eventDate", "==", date))
      );
      if (!eventSnap.empty) setEventName(eventSnap.docs[0].data().eventName);
    };
    fetchData();
  }, [date]);

  const countRatings = (key) => {
    const counts = { Excellent: 0, "Very Good": 0, Good: 0, Fair: 0, Poor: 0 };
    feedbacks.forEach((fb) => {
      const val = fb[key];
      if (val) counts[val]++;
    });
    return counts;
  };

  const generateSVGSegments = (counts) => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const radius = 80;
    const center = 100;
    const segments = [];

    let currentAngle = 0;

    Object.entries(counts).forEach(([label, count]) => {
      if (count === 0) return;

      const percentage = count / total;
      const angle = percentage * 360;
      const largeArc = angle > 180 ? 1 : 0;

      const x1 = center + radius * Math.cos((currentAngle - 90) * (Math.PI / 180));
      const y1 = center + radius * Math.sin((currentAngle - 90) * (Math.PI / 180));
      const x2 = center + radius * Math.cos((currentAngle + angle - 90) * (Math.PI / 180));
      const y2 = center + radius * Math.sin((currentAngle + angle - 90) * (Math.PI / 180));

      const path = `
        M ${center},${center}
        L ${x1},${y1}
        A ${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}
        Z
      `;

      const midAngle = currentAngle + angle / 2;
      const labelX = center + radius * 0.55 * Math.cos((midAngle - 90) * (Math.PI / 180));
      const labelY = center + radius * 0.55 * Math.sin((midAngle - 90) * (Math.PI / 180));

      segments.push({
        path,
        color: colorMap[label],
        label: `${Math.round(percentage * 100)}%`,
        labelX,
        labelY,
      });

      currentAngle += angle;
    });

    return { segments, total };
  };

  const exportPDF = () => {
    const input = reportRef.current;
    const buttons = document.querySelectorAll(".no-print");

    
    buttons.forEach((el) => (el.style.display = "none"));

    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      pdf.save(`feedback-report-${date}.pdf`);

      // Restore buttons
      buttons.forEach((el) => (el.style.display = "flex"));
    });
  };

  return (
    <div className="feedback-report-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <div className="header-icons">
            <Link to="/view-requests">
              <img src={viewRequestsIcon} alt="Requests" className="requests-img" />
            </Link>
            <Link to="/edit-profile">
              <img src={profileIcon} alt="Profile" className="profile-img" />
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

      <main className="report-content" ref={reportRef}>
        <h1>Event Feedback Report</h1>
        <p className="report-date">
          <strong>{eventName}</strong> <br />
          Event Date: <strong>{date}</strong>
        </p>

        <div className="color-legend">
          {Object.entries(colorMap).map(([label, color]) => (
            <div key={label}>
              <span style={{ background: color }}></span>
              {label}
            </div>
          ))}
        </div>

        {questions.map(({ key, label }) => {
          const counts = countRatings(key);
          const { segments, total } = generateSVGSegments(counts);

          return (
            <div className="chart-section" key={key}>
              <h3>{label}</h3>
              <div className="svg-wrapper">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {segments.map((seg, i) => (
                    <g key={i}>
                      <path d={seg.path} fill={seg.color} />
                      <text
                        x={seg.labelX}
                        y={seg.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pie-text"
                      >
                        {seg.label}
                      </text>
                    </g>
                  ))}
                </svg>
                <p className="total-label">Total Responses: {total}</p>
              </div>
            </div>
          );
        })}

        <div className="binary-section">
          {binaryQuestions.map(({ key, label }) => {
            const yes = feedbacks.filter((f) => f[key] === "Yes").length;
            const no = feedbacks.filter((f) => f[key] === "No").length;
            return (
              <div key={key} className="binary-row">
                <strong>{label}</strong>
                <p>Yes: {yes} | No: {no}</p>
              </div>
            );
          })}
          <div className="binary-row">
            <strong>Do you prefer curricular or extracurricular activities?</strong>
            <p>
              Curricular: {feedbacks.filter((f) => f.preference === "Curricular").length} | Extracurricular:{" "}
              {feedbacks.filter((f) => f.preference === "Extracurricular").length}
            </p>
          </div>
        </div>

        <div className="suggestions-section">
          <h3>Suggestions to Improve Events:</h3>
          <ul>
            {feedbacks
              .filter((f) => f.suggestions?.trim())
              .map((f, i) => (
                <li key={i}>{f.suggestions}</li>
              ))}
          </ul>
          <h3>Training Program / Activity Suggestions:</h3>
          <ul>
            {feedbacks
              .filter((f) => f.trainingSuggestions?.trim())
              .map((f, i) => (
                <li key={i}>{f.trainingSuggestions}</li>
              ))}
          </ul>
        </div>

        <div className="report-buttons no-print">
          <Link to="/view-requests" className="back-button">
            Back
          </Link>
          {feedbacks.length > 0 && (
            <button className="back-button" onClick={exportPDF}>
              Download PDF
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default FeedbackReport;
