const nodemailer = require("nodemailer");
require("dotenv").config();

// 📌 Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Change if using another provider
  auth: {
    user: process.env.EMAIL_USER, // Stored in .env
    pass: process.env.EMAIL_PASS, // Stored in .env
  },
  debug: true,
  logger: true,
});

// 📌 Function to Send Emails
const sendEmail = async (recipient, subject, message) => {
  console.log("📤 Attempting to send email to:", recipient);
  try {
    let info = await transporter.sendMail({
      from: `"Kasit-agenda" <${process.env.EMAIL_USER}>`, // ✅ Correct syntax
      to: recipient,
      subject: subject,
      text: message,
      html: `<p>${message}</p>`,
    });
    console.log("✅ Email sent successfully:", info);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("❌ Email error:", error);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
};


module.exports = { sendEmail };
