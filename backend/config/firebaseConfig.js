const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config(); // Load variables from .env file

// Local or deployment path from .env, or fallback
const serviceAccountPath = process.env.FIREBASE_KEY_PATH || './config/serviceAccountKey.json';

const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://kasit-agenda.firebaseio.com"
});

const db = admin.firestore();
module.exports = db;
