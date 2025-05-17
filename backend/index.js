const express = require('express');
const cors = require('cors'); 
const db = require('./config/firebaseConfig');  

const app = express();
const PORT = 3000;  

// Enable CORS
app.use(cors({
  origin: ["http://localhost:5173", "https://kasit-agenda.web.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

// Middleware to parse JSON
app.use(express.json());

//Booking Routes
const bookingRoutes = require("./routes/bookingRoutes"); 
app.use("/api/bookings", bookingRoutes); 

//Email Routes
const emailRoutes = require("./routes/emailRoutes");
app.use("/api/emails", emailRoutes); 

// Admin Routes 
const adminRoutes = require("./routes/adminRoutes");  
app.use("/api/admin", adminRoutes);  

// Default Route
app.get('/', (req, res) => {
  res.send('Welcome to KASIT Agenda API');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
