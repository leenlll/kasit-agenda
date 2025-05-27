const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

//  Load Gmail credentials from Firebase config
const gmailEmail = functions.config().gmail.email;
const gmailPass = functions.config().gmail.password;
const adminEmail = "leenanghami@gmail.com";

//  Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

//  Set up Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPass,
  },
});

// 📬 HTTP FUNCTION: Send Booking Confirmation Emails
exports.bookEvent = functions.https.onRequest(async (req, res) => {
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
    return res.status(400).json({ message: "Missing booking details" });
  }

  const messageToAdmin = `
📢 New Event Request:
📝 ${eventName}
📅 ${eventDate}
🕒 ${timeFrom} – ${timeTo}
📍 ${location}
👤 ${organizerName}
📨 ${organizerEmail}
  `;

  const messageToOrganizer = `
✅ Your Booking Request for "${eventName}" was Received!
We’ll notify you once it’s reviewed.
— KASIT Agenda Team
  `;

  try {
    // Send to admin
    await transporter.sendMail({
      from: `"Kasit Agenda" <${gmailEmail}>`,
      to: adminEmail,
      subject: `📢 New Booking: ${eventName}`,
      text: messageToAdmin,
    });

    // Send to organizer
    await transporter.sendMail({
      from: `"Kasit Agenda" <${gmailEmail}>`,
      to: organizerEmail,
      subject: `✅ Booking Received`,
      text: messageToOrganizer,
    });

    return res.status(200).json({ message: "Emails sent!" });

  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({ message: "Failed to send emails." });
  }
});
