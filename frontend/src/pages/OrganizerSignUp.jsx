import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./OrganizerSignUp.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import signupIcon from "../assets/signup.png";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const OrganizerSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    organization: "",
    email: "",
    password: "",
    ConfirmPassword: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.values(formData).some((value) => value.trim() === "")) {
      setError("⚠️ All fields are required.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // ✅ Store organizer details in Firestore
      await setDoc(doc(db, "organizers", user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        organization: formData.organization,
        phone: formData.phone,
        role: "organizer",
      });

      alert("✅ Registration successful!");
      navigate("/organizer-signin");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="organizer-signup-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <Link to="/">
            <img src={home} alt="Home" className="home-img" />
          </Link>
        }
      />

      <main className="signup-content">
        <motion.h1
          className="signup-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Organizer Sign Up
        </motion.h1>

        <motion.img
          src={signupIcon}
          alt="Sign Up"
          className="signup-img"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        />

        {error && <p className="error-message">{error}</p>}

        <motion.form
          className="signup-form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit}
        >
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            placeholder="Enter your first name"
            onChange={handleChange}
          />

          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            placeholder="Enter your last name"
            onChange={handleChange}
          />

          <label>Organization Name</label>
          <input
            type="text"
            name="organization"
            placeholder="Enter organization name"
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Create a password"
            onChange={handleChange}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="ConfirmPassword"
            placeholder="Confirm password"
            onChange={handleChange}
          />

          <label>Phone Number</label>
          <input
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            onChange={handleChange}
          />

          <button type="submit" className="signup-button">
            Sign Up
          </button>
        </motion.form>

        <p className="signin-text">
          Already have an account?{" "}
          <Link to="/organizer-signin">Sign In Here</Link>
        </p>
      </main>
    </div>
  );
};

export default OrganizerSignUp;
