const admin = require('firebase-admin');
const path = require('path');

// Load the service account key
const serviceAccount = require("/etc/secrets/serviceAccountKey.json");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kasit-agenda.firebaseio.com",  
});

const db = admin.firestore();

module.exports = db;
