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
const dayjs = require("dayjs");

// 🕓 GET /api/send-daily-reminders
router.get("/send-daily-reminders", async (req, res) => {
  try {
    const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");

    const remindersRef = db.collection("reminders");
    const snapshot = await remindersRef
      .where("eventDate", "==", tomorrow)
      .where("reminderSent", "==", false)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ message: "No reminders to send today." });
    }

    const batch = db.batch();

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      await transporter.sendMail({
        from: `"KASIT Agenda" <${process.env.EMAIL_USER}>`,
        to: data.email,
        subject: `📅 Reminder: ${data.eventName} is tomorrow!`,
        text: `Hi there!\n\nJust a reminder: "${data.eventName}" is happening tomorrow (${data.eventDate}).\n\nTime: ${data.timeSlot || "TBA"}\n\nGood luck!\n– KASIT Agenda Team`,
      });

      // ✅ Mark as sent
      batch.update(docSnap.ref, { reminderSent: true });
    }

    await batch.commit();
    res.status(200).json({ success: true, message: "Reminders sent." });
  } catch (err) {
    console.error("❌ Error sending reminders:", err);
    res.status(500).json({ success: false, message: "Failed to send reminders." });
  }
});

module.exports = router;
