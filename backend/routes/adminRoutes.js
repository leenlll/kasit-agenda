const express = require("express");
const { sendEmail } = require("../services/emailService");
const router = express.Router();


router.post("/update-booking-status", async (req, res) => {
  console.log("📩 Received admin request to update booking status:", req.body);

  let { organizerEmail, eventName, status } = req.body;

  if (!organizerEmail || !eventName || !status) {
    console.error("❌ Missing approval details:", req.body);
    return res.status(400).json({ success: false, message: "Missing approval details." });
  }

  try {
    status = status.toLowerCase();

  
   const decisionMessage =
  status === "approved"
    ? `Dear Organizer,

We’re happy to inform you that your event "${eventName}" has been approved!

You can now proceed with your preparations. For any updates, please check your dashboard.
We're excited to have you with us!

Best regards,  
KASIT Agenda Team`
    : `Dear Organizer,

We regret to inform you that your event "${eventName}" has been declined.

If you believe this was a mistake or would like to revise and resubmit the request, feel free to do so.

Best wishes,  
KASIT Agenda Team`;

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
