import { listenPlanning, COLLECTION } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
import { initUI,initSelects } from "./planning-ui.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {getAuth,onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db } from "./APIS/firebase.js";
import { migrateAll } from "./migration.js";

console.log("🔥 BOOTSTRAP CHARGÉ");
/* document.getElementById("btnMigrate")?.addEventListener("click", async () => {

    const confirmGo = confirm(
        "⚠️ Migration SAFE : cela va créer une copie de test du planning. Continuer ?"
    );
    if (!confirmGo) return;
     try {
        await migrateAll();
    } catch (err) {
        console.error("❌ Erreur migration :", err);
        alert("Erreur pendant la migration");
    }
    
}); */
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
        document.getElementById("an").textContent =
        document.getElementById("anneeSelect").value;
        // =========================
        // ID DOC
        // =========================
        function getDocId() {
            return document.getElementById("anneeSelect").value;
        }
        
        async function loadPlanning() {
            const docId = getDocId();

            if (!docId) return;

            if (loading) return;
            loading = true;

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

    // =========================
    // ❌ USER NON CONNECTÉ
    // =========================
    if (!user) {

        console.log("➡ USER DECONNECTÉ");

        document.getElementById("loginPage").style.display = "flex";
        document.getElementById("appPage").style.display = "none";

        if (unsubscribe) {
            unsubscribe();
        }

        return;
    }

    // =========================
    // ➡ USER CONNECTÉ
    // =========================
    console.log("➡ USER CONNECTÉ :", user.uid);

    try {

        // =========================
        // 👤 USER DOC
        // =========================
        await ensureUserDoc(user);

        const role = await getUserRole(user.uid);
        const isAdmin = role === "admin";

        console.log("ROLE :", role);

        // =========================
        // UI SWITCH
        // =========================
        document.getElementById("loginPage").style.display = "none";
        document.getElementById("appPage").style.display = "block";

        // =========================
        // GLOBAL STATE
        // =========================
        window.IS_ADMIN = isAdmin;

        // =========================
        // ADMIN UI
        // =========================
        const addBtn = document.getElementById("addEmploye");
        const select = document.getElementById("removeEmployeSelect");
        const deleteBtn = document.getElementById("deleteEmployeBtn");
        const adminBtn = document.getElementById("adminBtn");

        if (addBtn) addBtn.style.display = isAdmin ? "inline-block" : "none";
        if (select) select.style.display = isAdmin ? "inline-block" : "none";
        if (deleteBtn) deleteBtn.style.display = isAdmin ? "inline-block" : "none";
        if (adminBtn) adminBtn.style.display = isAdmin ? "inline-block" : "none";

        // =========================
        // DISABLE USER ACTIONS
        // =========================
        document.getElementById("exportBtn").disabled = !isAdmin;
        document.getElementById("copyBtn").disabled = !isAdmin;
        document.getElementById("pasteBtn").disabled = !isAdmin;
        document.getElementById("exportFormat").disabled = !isAdmin;
        document.getElementById("brushBtn").disabled = !isAdmin;
        document.getElementById("boldBtn").disabled = !isAdmin;

        // =========================
        // LOAD PLANNING
        // =========================
        console.log("🚀 LOAD PLANNING START");
        await loadPlanning();
        console.log("✅ LOAD PLANNING OK");

    } catch (err) {

        console.error("❌ AUTH ERROR :", err);

        document.getElementById("loginPage").style.display = "flex";
        document.getElementById("appPage").style.display = "none";
    }
        
        });
        // =========================
        // EVENTS + SAVE STATE
        // =========================
    document.getElementById("anneeSelect").addEventListener("change", (e) => {
            localStorage.setItem("annee", e.target.value);
            loadPlanning();
            document.getElementById("an").textContent = e.target.value;
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
        document.getElementById("adminBtn")
        ?.addEventListener("click", () => {

            if (!window.IS_ADMIN) return;
                window.location.href = "admin.html";
        });
});
async function ensureDocExists(docId) {

    if (!docId) {
        console.warn("❌ docId manquant");
        return;
    }

    const ref = doc(db, COLLECTION, docId);

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

