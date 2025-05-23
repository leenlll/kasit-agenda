import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./OrganizerSignIn.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import studentImg from "../assets/student.png"; 
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const StudentSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


const handleSignIn = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Logged in as:", result.user.email);
    navigate("/viewer-dashboard");
  } catch (err) {
    console.error("🔥 Firebase error:", err.code, err.message);
    setError("❌ " + err.message);
  }
};
  return (
    <div className="organizer-signin-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <Link to="/">
            <img src={home} alt="Home" className="home-img" />
          </Link>
        }
      />

      <main className="signin-content">
        <motion.h1
          className="signin-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Student Sign In
        </motion.h1>

        <motion.img
          src={studentImg}
          alt="Student"
          className="organizer-img"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        />

        <motion.form
          className="signin-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSignIn}
        >
          {error && <p className="error-message">{error}</p>}
          <br></br>
<label>Sign In Using JU Credintials</label>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="signin-button">
            Sign In
          </button>
        </motion.form>
      </main>
    </div>
  );
};

export default StudentSignIn;
