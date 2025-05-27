import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore"; 
import { sendPasswordResetEmail } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7HVfy8jsFeaH0cpaI3R3RZfUW2EQObjo",
  authDomain: "kasit-agenda.firebaseapp.com",
  projectId: "kasit-agenda",
  storageBucket: "kasit-agenda.appspot.com",
  messagingSenderId: "423560934213",
  appId: "1:423560934213:web:dc5f64313af5ba2681042c"
};


const app = initializeApp(firebaseConfig); 


const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, 
});


const auth = getAuth(app);

export { auth, db };
