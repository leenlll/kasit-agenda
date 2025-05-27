const express = require("express");
const { sendEmail } = require("../services/emailService");
const router = express.Router();


router.post("/book-event", async (req, res) => {
  console.log("📩 Organizer requested to book an event:", req.body);

  const {
    organizerEmail,
    organizerName,
    eventName,
    eventDate,
    timeFrom,
    timeTo,
    location,
    description,
  } = req.body;


  if (!organizerEmail || !eventName || !eventDate || !timeFrom || !timeTo || !location || !description) {
    console.error("❌ Missing booking details:", { organizerEmail, eventName, eventDate, timeFrom, timeTo, location, description });
    return res.status(400).json({ success: false, message: "Missing booking details." });
  }

  try {
    console.log("📤 Sending email to admins...");
    const adminEmails = ["leenanghami@gmail.com"]; 
   
const emailPromises = adminEmails.map(async (admin) => {

    const subject = `📢 New Booking Request: ${eventName} on ${eventDate}`;
    const message = `
Hello Admin,

A new event has been requested by an organizer. Here are the details:

📝 Event Name:   ${eventName}
📅 Date:         ${eventDate}
🕒 Time:         ${timeFrom} – ${timeTo}
📍 Location:     ${location}
📖 Description:  ${description}

👤 Organizer Info:
Name:  ${organizerName}
Email: ${organizerEmail}

Please review the request in the admin dashboard.

Thanks,  
KASIT Agenda System`.trim();

      try {
        await sendEmail(admin, subject, message);
        console.log(`✅ Email sent to admin: ${admin}`);
      } catch (emailError) {
        console.error(`❌ Failed to send to admin ${admin}:`, emailError);
      }
    });

    await Promise.all(emailPromises);
   
   
  const organizerSubject = ` Your Booking Request for "${eventName}" was Received`;

const organizerMessage = `
Hello ${organizerName},

Thank you for submitting your event booking request on KASIT Agenda.

📝 Event:        ${eventName}
📅 Date:         ${eventDate}
🕒 Time:         ${timeFrom} – ${timeTo}
📍 Location:     ${location}

Your request is currently pending review. You will receive another email once it's approved or denied.

If you have any questions, feel free to reply to this email.

— KASIT Agenda Team`.trim();

    await sendEmail(organizerEmail, organizerSubject, organizerMessage);
    console.log(`📧 Confirmation email sent to organizer: ${organizerEmail}`);

    res.status(200).json({ success: true, message: "Booking submitted. Admins and organizer notified." });

  } catch (error) {
    console.error("❌ Email process failed:", error);
    res.status(500).json({ success: false, message: "Error sending email notifications." });
  }
});

// ✅ Route: Notify Admins After Modification
router.post("/modify-event", async (req, res) => {
  const {
    organizerEmail,
    organizerName,
    eventName,
    eventDate,
    timeFrom,
    timeTo,
    location,
    description,
  } = req.body;

  if (!organizerEmail || !eventName || !eventDate) {
    return res.status(400).json({ message: "Missing modification details" });
  }

  const subject = `✏️ Modified Booking Request: ${eventName}`;
  const message = `
Hello Admin,

An event modification has been submitted.

📝 Event Name:   ${eventName}
📅 Date:         ${eventDate}
🕒 Time:         ${timeFrom} – ${timeTo}
📍 Location:     ${location}
✏️ Description:  ${description}

👤 Organizer Info:
Name:  ${organizerName}
Email: ${organizerEmail}

Please review it in the admin dashboard.

— KASIT Agenda System`.trim();

  try {
    await sendEmail("leenanghami@gmail.com", subject, message);
    res.status(200).json({ message: "Admin notified of modification." });
  } catch (error) {
    console.error("❌ Failed to send modification email:", error);
    res.status(500).json({ message: "Failed to send email." });
  }
});

module.exports = router;
