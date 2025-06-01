const nodemailer = require("nodemailer");
require("dotenv").config();


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  }, 
  debug: true,
  logger: true,
});


const sendEmail = async (recipient, subject, message) => {
  console.log("📤 Attempting to send email to:", recipient);

  try {
    const info = await transporter.sendMail({
      from: `"KASIT Agenda" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: subject,
      text: message,
    });

    console.log("✅ Email sent:", info.response);
    return { success: true, message: "Email sent successfully!" };

  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, message: `Failed to send email: ${error.message}` };
  }
};

module.exports = { sendEmail };
