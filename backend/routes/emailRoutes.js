const express = require("express");
const { sendEmail } = require("../services/emailService"); 
const router = express.Router();
const db = require("../config/firebaseConfig"); 

//  ROUTE 1 Send Email POST
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


//  ROUTE 2: Reminder Emails for Tomorrow's Events GET
router.get("/send-reminders", async (req, res) => {
  const now = new Date();

  const startOfTomorrow = new Date(now);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  startOfTomorrow.setHours(0, 0, 0, 0);

  const endOfTomorrow = new Date(startOfTomorrow);
  endOfTomorrow.setHours(23, 59, 59, 999);

  try {
    const snapshot = await db.collection("eventRequests")
      .where("status", "==", "approved")
      .where("eventDate", ">=", startOfTomorrow)
      .where("eventDate", "<=", endOfTomorrow)
      .get();

    if (snapshot.empty) {
      console.log("📭 No events scheduled for tomorrow.");
      return res.status(200).json({ success: true, message: "No events to remind." });
    }

    const reminders = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const formattedDate = data.eventDate.toDate().toLocaleDateString();

      const message = `
Hello ${data.organizerName},

Just a reminder that your approved event "${data.eventName}" is happening tomorrow:

📝 Event:        ${data.eventName}
📅 Date:         ${formattedDate}
🕒 Time:         ${data.timeFrom} – ${data.timeTo}
📍 Location:     ${data.location}

Good luck! Check your dashboard for any updates.

— KASIT Agenda System
      `.trim();

      return sendEmail(
        data.organizerEmail,
        `⏰ Reminder: "${data.eventName}" is Tomorrow`,
        message
      );
    });

    await Promise.all(reminders);

    console.log("✅ Reminder emails sent.");
    res.status(200).json({ success: true, message: "Reminder emails sent!" });

  } catch (error) {
    console.error("❌ Error sending reminders:", error);
    res.status(500).json({ success: false, message: "Error sending reminders." });
  }
});

module.exports = router;
