const admin = require('firebase-admin');
const path = require('path');

// Load the service account key
const serviceAccount = require(path.join(__dirname, 'serviceAccountKey.json'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kasit-agenda.firebaseio.com",  // Needed for Realtime DB, can be omitted for Firestore
});

const db = admin.firestore();

module.exports = db;
