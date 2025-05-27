const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");


const gmailEmail = functions.config().gmail.email;
const gmailPass = functions.config().gmail.password;
const adminEmail = "leenanghami@gmail.com";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailEmail,
    pass: gmailPass,
  },
});


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
    
    await transporter.sendMail({
      from: `"Kasit Agenda" <${gmailEmail}>`,
      to: adminEmail,
      subject: `📢 New Booking: ${eventName}`,
      text: messageToAdmin,
    });

    
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

// 🔔 SCHEDULED FUNCTION: Daily Reminder for Tomorrow
exports.sendReminders = functions.pubsub
  .schedule("every day 08:00")
  .timeZone("Asia/Amman")
  .onRun(async () => {
    console.log("⏰ Running reminder scheduler...");

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
        console.log("📭 No events to remind.");
        return null;
      }

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const formattedDate = data.eventDate.toDate().toLocaleDateString();

        const reminderMsg = `
Hello ${data.organizerName},

This is a reminder that your approved event "${data.eventName}" is happening tomorrow:

📝 ${data.eventName}
📅 ${formattedDate}
🕒 ${data.timeFrom} – ${data.timeTo}
📍 ${data.location}

Best of luck,  
— KASIT Agenda System
        `.trim();

        await transporter.sendMail({
          from: `"Kasit Agenda" <${gmailEmail}>`,
          to: data.organizerEmail,
          subject: `⏰ Reminder: "${data.eventName}" is Tomorrow`,
          text: reminderMsg,
        });

        console.log(`✅ Reminder sent to: ${data.organizerEmail}`);
      }

    } catch (err) {
      console.error("❌ Error sending reminders:", err);
    }

    return null;
  });
