import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAKyR8MU6evyhL4qo-fBuza6keMJMzowBg",
  authDomain: "planning-tech.firebaseapp.com",
  projectId: "planning-tech",
  storageBucket: "planning-tech.firebasestorage.app",
  messagingSenderId: "94701373220",
  appId: "1:94701373220:web:45e4c04e66ff7677cf55b1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
window.db = db;