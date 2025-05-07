const express = require("express");
const { sendEmail } = require("../services/emailService");
const router = express.Router();

// 📌 Route: Admin Approves/Deny Event (Notify Organizer)
router.post("/update-booking-status", async (req, res) => {
  console.log("📩 Received admin request to update booking status:", req.body);

  let { organizerEmail, eventName, status } = req.body;

  if (!organizerEmail || !eventName || !status) {
    console.error("❌ Missing approval details:", req.body);
    return res.status(400).json({ success: false, message: "Missing approval details." });
  }

  try {
    // ✅ Normalize status to lowercase for consistent checking
    status = status.toLowerCase();

    // 📩 Notify Organizer with the correct status message
    const decisionMessage =
      status === "approved"
        ? `Your event "${eventName}" has been APPROVED!`
        : `Unfortunately, your event "${eventName}" has been DENIED.`;

    console.log(`📤 Sending email to organizer: ${organizerEmail} | Status: ${status.toUpperCase()}`);
    await sendEmail(organizerEmail, `Event ${status.charAt(0).toUpperCase() + status.slice(1)}`, decisionMessage);
    console.log(`✅ Email sent successfully to organizer: ${organizerEmail}`);

    res.status(200).json({ success: true, message: `Organizer notified about ${status}.` });
  } catch (error) {
    console.error("❌ Error updating booking status:", error);
    res.status(500).json({ success: false, message: `Error updating booking status: ${error.message}` });
  }
});

module.exports = router;
