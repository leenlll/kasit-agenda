const express = require('express');
const cors = require('cors');
const db = require('./config/firebaseConfig');
require('dotenv').config(); // ✅ Load .env variables
const app = express();
const PORT = 3000;

// ✅ Debug check: make sure email credentials are loaded
console.log("✅ ENV loaded:", {
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? "✅ Exists" : "❌ Missing"
});

// ✅ Enable CORS
app.use(cors({
  origin: ["http://localhost:5173", "https://kasit-agenda.web.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

// ✅ Parse incoming JSON
app.use(express.json());

// ✅ Routes
const bookingRoutes = require("./routes/bookingRoutes");
const emailRoutes = require("./routes/emailRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reminderRoutes = require("./routes/reminderRoutes");

// ✅ Mount routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", reminderRoutes);

// ✅ Default route
app.get('/', (req, res) => {
  res.send('Welcome to KASIT Agenda API');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
