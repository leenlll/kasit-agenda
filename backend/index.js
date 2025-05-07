const express = require('express');
const cors = require('cors'); 
const db = require('./config/firebaseConfig');  

const app = express();
const PORT = 3000;  

// ✅ Enable CORS
app.use(cors({
  origin: "http://localhost:5173", 
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

// ✅ Import and Use Booking Routes
const bookingRoutes = require("./routes/bookingRoutes"); 
app.use("/api/bookings", bookingRoutes); 

// ✅ Import and Use Email Routes
const emailRoutes = require("./routes/emailRoutes");
app.use("/api/emails", emailRoutes); 

// ✅ Import and Use Admin Routes (Fix for 404 Error)
const adminRoutes = require("./routes/adminRoutes");  // ✅ Add this line
app.use("/api/admin", adminRoutes);  // ✅ Now backend recognizes /api/admin

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to KASIT Agenda API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
