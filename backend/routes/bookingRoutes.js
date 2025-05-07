const express = require("express");
const { sendEmail } = require("../services/emailService"); // ✅ Import email service
const router = express.Router();

// 📌 Route: Organizer Books an Event (Notify Admins)
router.post("/book-event", async (req, res) => {
  console.log("📩 Organizer requested to book an event:", req.body);

  const { organizerEmail, eventName, eventDate, timeFrom, timeTo, location, description } = req.body;

  // ✅ Validate required fields
  if (!organizerEmail || !eventName || !eventDate || !timeFrom || !timeTo || !location || !description) {
    console.error("❌ Missing booking details:", { organizerEmail, eventName, eventDate, timeFrom, timeTo, location, description });
    return res.status(400).json({ success: false, message: "Missing booking details." });
  }

  try {
    console.log("📤 Sending email to admins...");
    const adminEmails = ["leen.lamper@gmail.com", "leenanghami@gmail.com"]; // ✅ List of admin emails

    // ✅ Send email to all admins asynchronously & catch individual failures
    const emailPromises = adminEmails.map(async (admin) => {
      try {
        await sendEmail(
          admin,
          "🔔 New Event Booking Notification",
          `📅 Event: ${eventName}
📍 Location: ${location}
🕒 Time: ${timeFrom} to ${timeTo}
📖 Description: ${description}
📆 Date: ${eventDate}
📨 Organizer Email: ${organizerEmail}`
        );
        console.log(`✅ Email sent successfully to ${admin}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${admin}:`, emailError);
      }
    });

    await Promise.all(emailPromises); // ✅ Wait for all email attempts

    console.log("✅ All email notifications processed!");
    res.status(200).json({ success: true, message: "Booking submitted, admins notified!" });
  } catch (error) {
    console.error("❌ Error sending booking email:", error);
    res.status(500).json({ success: false, message: "Error sending booking email." });
  }
});

module.exports = router;
