// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { auth, db } from "../firebaseConfig";
// import {
//   signInWithEmailAndPassword
// } from "firebase/auth";
// import {
//   collection,
//   query,
//   where,
//   getDocs
// } from "firebase/firestore";
// import "./AdminSignIn.css";
// import Background from "../components/Background";
// import Header from "../components/Header";
// import home from "../assets/home.png";
// import adminsignin from "../assets/adminsignin.png";

// const AdminSignIn = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
  

//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!email || !password) {
//       setError("⚠️ Please fill in both fields.");
//       return;
//     }

//     try {
//       // ✅ Firebase authentication
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;

//       // ✅ Check Firestore admins collection by email (NOT uid)
//       const q = query(collection(db, "admins"), where("email", "==", user.email));
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         console.log("✅ Admin authenticated:", querySnapshot.docs[0].data());
//         navigate("/admin-dashboard");
//       } else {
//         setError("❌ Access Denied. You are not an admin.");
//       }
//     } catch (error) {
//       console.error(error);
//       setError("❌ Invalid email or password.");
//     }
//   };

//   return (
//     <div className="admin-signin-page">
//       <Background />
//       <Header
//         showAboutUs={false}
//         extraRightContent={
//           <Link to="/">
//             <img src={home} alt="Home" className="home-img" />
//           </Link>
//         }
//       />

//       <main className="signin-content">
//         <motion.h1
//           className="signin-title"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           Administrator Sign In
//         </motion.h1>

//         <motion.img
//           src={adminsignin}
//           alt="Admin"
//           className="admin-img"
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 0.6 }}
//         />

//         <motion.form
//           className="signin-form"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           onSubmit={handleSignIn}
//         >
//           {error && <p className="error-message">{error}</p>}
//           <label>Email</label>
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />

//           <label>Password</label>
//           <input
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           <button type="submit" className="signin-button">Sign In</button>
//         </motion.form>

//         <p className="signup-text">
//           Organizer? <Link to="/organizer-signin">Go to Sign In for Organizers</Link>
//         </p>
//       </main>
//     </div>
//   );
// };

// export default AdminSignIn;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs
} from "firebase/firestore";
import "./AdminSignIn.css";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import adminsignin from "../assets/adminsignin.png";

const AdminSignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Forgot password popup states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("⚠️ Please fill in both fields.");
      return;
    }

    try {
      // ✅ Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Check Firestore admins collection by email (NOT uid)
      const q = query(collection(db, "admins"), where("email", "==", user.email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("✅ Admin authenticated:", querySnapshot.docs[0].data());
        navigate("/admin-dashboard");
      } else {
        setError("❌ Access Denied. You are not an admin.");
      }
    } catch (error) {
      console.error(error);
      setError("❌ Invalid email or password.");
    }
  };

  // Forgot password email submit handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");

    if (!resetEmail) {
      setResetError("⚠️ Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("✅ Password reset email sent. Please check your inbox.");
    } catch (error) {
      setResetError("❌ Failed to send reset email. Please check the email address.");
    }
  };

  return (
    <div className="admin-signin-page">
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
          Administrator Sign In
        </motion.h1>

        <motion.img
          src={adminsignin}
          alt="Admin"
          className="admin-img"
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

          <button type="submit" className="signin-button">Sign In</button>
        </motion.form>

        {/* Forgot Password link */}
        <p
          className="forgot-password-text"
          onClick={() => {
            setShowForgotPassword(true);
            setResetEmail(email); // optionally pre-fill with signin email
            setResetError("");
            setResetSuccess("");
          }}
          style={{ cursor: "pointer", color: "#007bff", textAlign: "center", marginTop: "10px" }}
        >
          Forgot Password?
        </p>

        <p className="signup-text">
          Organizer? <Link to="/organizer-signin">Go to Sign In for Organizers</Link>
        </p>
      </main>

      {/* Forgot Password Popup */}
      {showForgotPassword && (
        <div className="forgot-password-popup-overlay">
          <div className="forgot-password-popup">
            <h2>Reset Password</h2>
            <form onSubmit={handleResetPassword}>
              {resetError && <p className="error-message">{resetError}</p>}
              {resetSuccess && <p className="success-message">{resetSuccess}</p>}
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <div className="forgot-password-buttons">
                <button type="submit" className="reset-button">Send Reset Email</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSignIn;
