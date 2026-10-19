// Firebase setup — same project and config as before (teamhub-29f2a).
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhYm3ho1GCjSczfHW0y7r8niBcEcfUp6g",
  authDomain: "teamhub-29f2a.firebaseapp.com",
  projectId: "teamhub-29f2a",
  storageBucket: "teamhub-29f2a.firebasestorage.app",
  messagingSenderId: "833689691030",
  appId: "1:833689691030:web:266eae2d127b71a842f3b7",
  measurementId: "G-2SNKBMYC40",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
