const express = require("express");
const { sendEmail } = require("../services/emailService");
const router = express.Router();
const db = require("../config/firebaseConfig");

// ✅ 1. Generic email route
router.post("/send-email", async (req, res) => {
  const { recipient, subject, message } = req.body;

  if (!recipient || !subject || !message) {
    console.error("❌ Missing email parameters:", { recipient, subject, message });
    return res.status(400).json({ success: false, message: "Missing email parameters." });
  }

  try {
    console.log(`📩 Sending email to: ${recipient}`);
    const result = await sendEmail(recipient, subject, message);

    if (result.success) {
      console.log(`✅ Email sent successfully to ${recipient}`);
      return res.status(200).json({ success: true, message: "Email sent successfully!" });
    } else {
      console.error(`❌ Email failed to send to ${recipient}:`, result.error);
      return res.status(500).json({ success: false, message: "Failed to send email." });
    }
  } catch (error) {
    console.error("❌ Unexpected error sending email:", error);
    return res.status(500).json({ success: false, message: "Unexpected error sending email." });
  }
});

// ✅ 2. Student registration confirmation email route
router.post("/register-confirmation", async (req, res) => {
  const { to, eventName, eventDate } = req.body;

  if (!to || !eventName || !eventDate) {
    console.error("❌ Missing registration email fields:", { to, eventName, eventDate });
    return res.status(400).json({ success: false, message: "Missing email fields." });
  }

  const subject = `✅ Registration Confirmed: ${eventName}`;
  const message = `
Hello,

You’ve successfully registered for the event:

📝 Event: ${eventName}
📅 Date: ${eventDate}

Thank you for registering.
We look forward to seeing you at the event!

— KASIT Agenda System
`.trim();

  try {
    const result = await sendEmail(to, subject, message);
    console.log(`📤 Confirmation email sent to ${to}`);
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ Failed to send registration confirmation email:", error);
    return res.status(500).json({ success: false, message: "Failed to send confirmation email." });
  }
});

module.exports = router;
