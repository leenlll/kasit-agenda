const express = require("express");
const { sendEmail } = require("../services/emailService"); // Import email service
const router = express.Router();

// 📌 POST Route to Send Email
router.post("/send-email", async (req, res) => {
  const { recipient, subject, message } = req.body;

  // ✅ Validate required fields
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

module.exports = router;
