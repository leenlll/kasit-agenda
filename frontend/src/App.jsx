import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // ✅ Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // ✅ Import Toastify styles

import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import ViewerDashboard from "./pages/ViewerDashboard";
import EventInfo from "./pages/EventInfo";
import OrganizerSignIn from "./pages/OrganizerSignIn"; 
import OrganizerSignUp from "./pages/OrganizerSignUp";
import AvailableBookings from "./pages/AvailableBookings";
import BookingPage from "./pages/BookingPage";
import ViewRequests from "./pages/ViewRequests";
import ModifyRequest from "./pages/ModifyRequest"; 
import AdminSignIn from "./pages/AdminSignIn"; 
import AdminDashboard from "./pages/AdminDashboard"; 
import AddFeedback from "./pages/AddFeedback";
import FeedbackReport from './pages/FeedbackReport';
import EditOrganizerProfile from "./pages/EditOrganizerProfile";

function App() {
  return (
    <Router>
      <ToastContainer /> 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ViewerDashboard" element={<ViewerDashboard />} />
        <Route path="/EventInfo/:date" element={<EventInfo />} />
        <Route path="/organizer-signin" element={<OrganizerSignIn />} />
        <Route path="/organizer-signup" element={<OrganizerSignUp />} />
        <Route path="/available-bookings" element={<AvailableBookings />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/view-requests" element={<ViewRequests />} /> 
        <Route path="/modify-request/:id" element={<ModifyRequest />} />
        <Route path="/admins" element={<AdminSignIn />} /> 
        <Route path="/admin-dashboard" element={<AdminDashboard />} /> 
        <Route path="/add-feedback/:date" element={<AddFeedback />} /> 
        <Route path="/feedback-report/:date" element={<FeedbackReport />} />
        <Route path="/edit-profile" element={<EditOrganizerProfile />} />


        </Routes>
    </Router>
  );
}

export default App;
