// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-4l49U0G-1XUWn6mL1Zki0x_Jth4y1MQ",
  authDomain: "esans-talep-sistemi.firebaseapp.com",
  projectId: "esans-talep-sistemi",
  storageBucket: "esans-talep-sistemi.firebasestorage.app",
  messagingSenderId: "810199839185",
  appId: "1:810199839185:web:42f13704bfa5318aaeb0f0",
  measurementId: "G-4SQE8S8NYC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Export the Firebase app instance and Firestore
export default app;
export { db, analytics };