# KASIT Agenda

[![React](https://img.shields.io/badge/Built%20with-React-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Powered%20by-Firebase-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)

An event booking and management platform for the University of Jordan's King Abdullah II School for Information Technology (KASIT). It allows students to register for events, organizers to manage event requests, and admins to oversee and monitor activity.

---

## Features:

### 1. For Students
- View and register for upcoming events
- Track registered events in a personal dashboard
- Submit requests to modify or cancel registrations
- Receive confirmation emails upon registration

### 2. For Organizers
- Submit booking requests for new events
- Include event details like title, description, location, and time
- Modify or cancel event requests before approval
- Track the status of event requests (pending, approved, rejected)
- View list of registered students for their events
- Export registered lists to PDF

### 3. For Admins
- View, approve, or reject event requests
- Access full event logs and request history
- Search, filter, and sort logs by date, status, and event
- View registered students across all events
- Download participant lists in CSV/PDF format
- Send confirmation emails automatically using backend service

---

##  Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Authentication, Functions)
- **Email Service**: Node.js + Express (deployed on Render)
- **PDF Generation**: jsPDF
- **Data Export**: CSV / PDF

---

##  Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/leenlll/kasit-agenda.git
cd kasit-agenda
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file and add your Firebase config:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 4. Run the app
```bash
npm run dev
```

---

##  Folder Structure

```
kasit-agenda/
├── public/
├── src/
│   ├── pages/
│   │   ├── Student/
│   │   ├── Organizer/
│   │   ├── Admin/
│   ├── components/
│   ├── modals/
│   ├── hooks/
│   └── utils/
├── functions/        # Firebase backend functions (email sending)
├── .env              # Firebase environment config
├── .gitignore
├── README.md
└── package.json
```

---

## Project Structure

This project contains multiple types of files used for different parts of the system:

- `.aspx` and `.aspx.cs` files: Legacy ASP.NET WebForms pages that handle some backend and UI functionality.
- React files (`.jsx`, `.js`): The modern frontend components and pages.
- Other supporting files: CSS, JSON configs, and scripts.

All files are currently kept in the root directory for simplicity. Despite this, the project runs both legacy WebForms and React frontend parts together.

---


##  About

Developed by **Leen Lamber** as a graduation project  
Faculty: King Abdullah II School for Information Technology  
University of Jordan · 2025
