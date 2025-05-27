const express = require('express');
const cors = require('cors');
const db = require('./config/firebaseConfig');
require('dotenv').config(); // ✅ Load .env variables
const app = express();
const PORT = 3000;


app.use(cors({
  origin: ["http://localhost:5173", "https://kasit-agenda.web.app"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));


app.use(express.json());


const bookingRoutes = require("./routes/bookingRoutes"); 
app.use("/api/bookings", bookingRoutes); 


const emailRoutes = require("./routes/emailRoutes");
app.use("/api/emails", emailRoutes); 
 
const adminRoutes = require("./routes/adminRoutes");  
app.use("/api/admin", adminRoutes);  

app.use("/api", reminderRoutes);


app.get('/', (req, res) => {
  res.send('Welcome to KASIT Agenda API');
});


app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
