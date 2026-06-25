import { setDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

async function testFirestore() {
    try {
        //console.log("⏳ écriture en cours...");
        await setDoc(doc(db, "test", "testDoc"), {
            message: "Firestore fonctionne 👍",
            date: new Date().toISOString()
        });
        //console.log("✅ écrit en base");
        
    } catch (e) {
        console.error(e);
        alert("Erreur Firestore : " + e.message);
    }
}

// optionnel
window.testFirestore = testFirestore;
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
