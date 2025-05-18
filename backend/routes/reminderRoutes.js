const express = require("express");
const router = express.Router();
const db = require("../config/firebaseConfig");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

router.post("/reminders", async (req, res) => {
  const { email, eventName, eventDate, timeSlot } = req.body;

  if (!email || !eventName || !eventDate) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    await db.collection("reminders").add({
      email,
      eventName,
      eventDate,
      timeSlot: timeSlot || "N/A",
      createdAt: new Date().toISOString(),
      reminderSent: false,
    });

    res.status(200).json({ success: true, message: "Reminder saved successfully." });
  } catch (err) {
    console.error("❌ Failed to save reminder:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;
