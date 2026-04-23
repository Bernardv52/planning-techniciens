
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
console.log("🔥 fichier Firebase chargé");
//alert("JS chargé");
const firebaseConfig = {
  apiKey: "AIzaSyAKyR8MU6evyhL4qo-fBuza6keMJMzowBg",
  authDomain: "planning-tech.firebaseapp.com",
  projectId: "planning-tech",
  storageBucket: "planning-tech.firebasestorage.app",
  messagingSenderId: "94701373220",
  appId: "1:94701373220:web:45e4c04e66ff7677cf55b1"
};

const app = initializeApp(firebaseConfig);
console.log("✅ Firebase initialisé");
//const auth = getAuth(app);
const db = getFirestore(app);
console.log("✅ Firestore prêt");
// bouton login
/* document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
        alert("Erreur : " + e.message);
    }
});

// détecter utilisateur connecté
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("Connecté :", user.email);

        document.getElementById("loginBox").style.display = "none";
    } else {
        document.getElementById("loginBox").style.display = "block";
    }
}); */
async function testFirestore() {
    try {
        console.log("⏳ écriture en cours...");
        await setDoc(doc(db, "test", "testDoc"), {
            message: "Firestore fonctionne 👍",
            date: new Date().toISOString()
        });
        console.log("✅ écrit en base");
        alert("Firestore OK 👍");
    } catch (e) {
        console.error(e);
        alert("Erreur Firestore : " + e.message);
    }
}

window.db = db;
// test login
/* async function testLogin() {
    try {
        const user = await signInWithEmailAndPassword(
            auth,
            "bernard.azincendie@outlook.fr",
            "@Incendie"
        );

        console.log("Connecté :", user.user.email);
        alert("Connexion OK 👍");
    } catch (e) {
        alert("Erreur : " + e.message);
    }
}

testLogin(); */
