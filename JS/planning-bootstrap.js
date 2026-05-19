import { listenPlanning } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
import { initUI,initSelects } from "./planning-ui.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {getAuth,onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db } from "./APIS/firebase.js";
/* import { migratePlanning } from "./migration.js"; // seulement si besoin
window.migratePlanning = migratePlanning; */

document.addEventListener("DOMContentLoaded", () => {

    console.log("BOOTSTRAP CHARGÉ");

    initUI();
    initSelects();

    let unsubscribe = null;
    let loading = false;
    // =========================
    // 🔥 RESTORE STATE (AVANT LOAD)
    // =========================
    const savedAnnee = localStorage.getItem("annee");
    const savedBloc = localStorage.getItem("bloc");

    if (savedAnnee) {
        document.getElementById("anneeSelect").value = savedAnnee;
    }

    if (savedBloc) {
        document.getElementById("moisSelect").value = savedBloc;
    }
    // =========================
    // ID DOC
    // =========================
    function getDocId() {
        return document.getElementById("anneeSelect").value;
    }
    
    async function loadPlanning() {
        if (loading) return;
        loading = true;
        const docId = getDocId();

        console.log("🚀 Chargement planning :", docId);

        // 🔥 AJOUT CRITIQUE
        await ensureDocExists(docId);

        if (unsubscribe) unsubscribe();

        unsubscribe = listenPlanning(docId, refreshPlanning);
        loading = false;
    }
    async function ensureUserDoc(user) {

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {

        await setDoc(ref, {
            email: user.email,
            role: "user"
        });

        console.log("👤 Utilisateur créé");
    }
}

async function getUserRole(uid) {

    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return "user";

    return snap.data().role;
}
     // =========================
    // AUTH
    // =========================
     const auth = getAuth();

    onAuthStateChanged(auth, async (user) => {
        console.log("AUTH STATE CHANGED :", user?.email || "null");

        if (user) {

            console.log("➡ USER CONNECTÉ");

            // =========================
            // 👤 CREATE USER DOC
            // =========================
            await ensureUserDoc(user);

            // =========================
            // 🔐 GET ROLE
            // =========================
            const role = await getUserRole(user.uid);

            console.log("ROLE :", role);

            const isAdmin = role === "admin";

            // =========================
            // UI AUTH
            // =========================
            document.getElementById("loginPage").style.display = "none";

            document.getElementById("appPage").style.display = "block";

            // =========================
            // 🔒 DROITS
            // =========================
            window.IS_ADMIN = isAdmin;

            // boutons admin seulement
            document.getElementById("addEmploye").style.display =
                isAdmin ? "inline-block" : "none";

            document.getElementById("removeEmploye").style.display =
                isAdmin ? "inline-block" : "none";

            // export interdit aux users
            document.getElementById("exportBtn").disabled = !isAdmin;
            //copier/coller interdit aux usagers
            document.getElementById("copyBtn").disabled = !isAdmin;
            document.getElementById("pasteBtn").disabled = !isAdmin;
            document.getElementById("exportFormat").disabled = !isAdmin;
            document.getElementById("brushBtn").disabled = !isAdmin;
            document.getElementById("boldBtn").disabled = !isAdmin; 
            //document.getElementById("color-btn").disabled = !isAdmin;

            await loadPlanning();

        } else {

            console.log("➡ USER DECONNECTÉ");

            document.getElementById("loginPage").style.display = "flex";

            document.getElementById("appPage").style.display = "none";

            if (unsubscribe) {
                unsubscribe();
            }
        }
       
    });
    // =========================
    // EVENTS + SAVE STATE
    // =========================
   document.getElementById("anneeSelect").addEventListener("change", (e) => {
        localStorage.setItem("annee", e.target.value);
        loadPlanning();
    });
    document.getElementById("moisSelect").addEventListener("change", (e) => {
        localStorage.setItem("bloc", e.target.value);
        loadPlanning();
    });

    // =========================
    // LOGOUT
    // =========================
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            await signOut(auth);
            console.log("Déconnecté");
        });
    }
});
async function ensureDocExists(docId) {

    const ref = doc(db, "planning", docId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        console.log("🆕 création doc :", docId);

        await setDoc(ref, {
            employes: [],
            presence: {},
            blocs: {
                bloc1: { data: {} },
                bloc2: { data: {} },
                bloc3: { data: {} }
            }
        });
    }
}

