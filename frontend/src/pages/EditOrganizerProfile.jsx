import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import Background from "../components/Background";
import Header from "../components/Header";
import home from "../assets/home.png";
import logoutIcon from "../assets/logout.png";
import viewRequestsIcon from "../assets/view-requests.png";
import "./EditOrganizerProfile.css";

const EditOrganizerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(auth.currentUser);
  const [originalData, setOriginalData] = useState({});
  const [formData, setFormData] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef = doc(db, "organizers", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOriginalData(docSnap.data());
          setFormData(docSnap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReauthentication = async () => {
    const password = prompt("Please enter your current password:");
    if (!password) throw new Error("Password is required for reauthentication.");

    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  };

  const handleSave = async () => {
    try {
      await handleReauthentication(); // secure update

      const userDoc = doc(db, "organizers", user.uid);
      await updateDoc(userDoc, formData);
      setOriginalData(formData);
      setMessage("✅ Profile updated!");
      setIsEditing(false);

      if (newPassword && newPassword === confirmPassword) {
        await updatePassword(user, newPassword);
        setMessage("✅ Profile and password updated!");
      } else if (newPassword || confirmPassword) {
        setMessage("⚠️ Passwords do not match.");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Failed to update profile. " + error.message);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
    setMessage("❎ Changes reverted.");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
    if (!confirmDelete) return;

    try {
      await handleReauthentication();
      await deleteDoc(doc(db, "organizers", user.uid));
      await user.delete();
      alert("❌ Account deleted.");
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Could not delete account. " + error.message);
    }
  };

  const handleClearEvents = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all submitted events?");
    if (!confirmClear) return;

    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);

    const deletions = snapshot.docs
      .filter(docSnap => docSnap.data().organizerId === user.uid)
      .map(docSnap => deleteDoc(doc(db, "events", docSnap.id)));

    await Promise.all(deletions);
    alert("🗑 All submitted events cleared.");
  };

  const handleLogout = async () => {
    const confirm = window.confirm("Are you sure you want to log out?");
    if (!confirm) return;

    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="edit-profile-page">
      <Background />
      <Header
        showAboutUs={false}
        extraRightContent={
          <div className="header-icons">
            <Link to="/view-requests"><img src={viewRequestsIcon} alt="Requests" className="requests-img" /></Link>
            <img src={logoutIcon} alt="Logout" className="logout-img" onClick={handleLogout} />
            <Link to="/"><img src={home} alt="Home" className="home-img" /></Link>
          </div>
        }
      />

      <div className="edit-form-container">
        <h1>Organizer Profile</h1>

        {["email", "firstName", "lastName", "organization", "phone"].map((field) => (
          <div className="input-group" key={field}>
            <label>{field}</label>
            {isEditing ? (
              <input
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
                className="editable-input"
              />
            ) : (
              <p className="readonly-text">{originalData[field] || "—"}</p>
            )}
            <span className="tooltip">
              {isEditing ? `Edit your ${field}` : `Current ${field}`}
            </span>
          </div>
        ))}

        {isEditing && (
          <>
            <div className="input-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="editable-input"
              />
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="editable-input"
              />
            </div>
          </>
        )}

        <div className="button-group">
          <button className="cancel-btn" onClick={() => navigate(-1)}>Back</button>

          {isEditing ? (
            <>
              <button className="save-btn" onClick={handleSave}>Save</button>
              <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>

        {message && <p className="status-message">{message}</p>}

        <div className="danger-zone">
          <button className="danger-btn" onClick={handleDeleteAccount}>Delete Account</button>
          <button className="clear-btn" onClick={handleClearEvents}>Clear Submitted Events</button>
        </div>
      </div>
    </div>
  );
};

export default EditOrganizerProfile;