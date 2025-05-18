import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./OrganizerSignIn.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import organizerImg from "../assets/organizer.png";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

const OrganizerSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  const [showResetPopup, setShowResetPopup] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("⚠️ Please fill in both fields.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/available-bookings");
    } catch (error) {
      setError("❌ Invalid email or password.");
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
          Organizer Sign In
        </motion.h1>

        <motion.img
          src={organizerImg}
          alt="Organizer"
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

          <p
            className="forgot-password"
            onClick={() => setShowResetPopup(true)}
          >
            Forgot Password?
          </p>

          <button type="submit" className="signin-button">
            Sign In
          </button>
        </motion.form>

        <p className="signup-text">
          Don't have an account? <Link to="/organizer-signup">Sign Up Here</Link>
        </p>


        {showResetPopup && (
          <div className="popup-overlay">
            <div className="popup-box">
              <button className="close-button" onClick={() => setShowResetPopup(false)}>✖</button>
              <h2>Reset Password</h2>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button
                className="reset-submit-button"
                onClick={async () => {
                  if (!resetEmail) {
                    setResetMessage("⚠️ Please enter your email.");
                    return;
                  }
                  try {
                    await sendPasswordResetEmail(auth, resetEmail);
                    setResetMessage("✅ Reset email sent!");
                  } catch (error) {
                    setResetMessage("❌ Failed to send reset email.");
                  }
                }}
              >
                Send Reset Email
              </button>
              {resetMessage && <p className="reset-message">{resetMessage}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrganizerSignIn;
