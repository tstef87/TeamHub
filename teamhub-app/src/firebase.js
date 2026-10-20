// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhYm3ho1GCjSczfHW0y7r8niBcEcfUp6g",
  authDomain: "teamhub-29f2a.firebaseapp.com",
  projectId: "teamhub-29f2a",
  storageBucket: "teamhub-29f2a.firebasestorage.app",
  messagingSenderId: "833689691030",
  appId: "1:833689691030:web:266eae2d127b71a842f3b7",
  measurementId: "G-2SNKBMYC40"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// ✅ Key change: Use initializeAuth and force localStorage persistence
export const auth = initializeAuth(app, {
  persistence: browserLocalPersistence
});

export const db = getFirestore(app);