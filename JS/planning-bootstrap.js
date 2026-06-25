import { listenPlanning, COLLECTION } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
import { initUI,initSelects } from "./planning-ui.js";
import { getJoursFeriesRaw,formatDateKey } from "./planning-utils.js";
import { doc, getDoc, setDoc,collection, deleteDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {getAuth,onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db } from "./APIS/firebase.js";
import { migrateAll } from "./migration.js";
import { afficherMessageIndex } from "./barreTools.js";

//console.log("🔥 BOOTSTRAP CHARGÉ");

document.addEventListener("DOMContentLoaded", () => {

        //console.log("BOOTSTRAP CHARGÉ");

        initUI();
        initSelects();
        runYearlyCleanupOnce();

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
           // console.log("DOC ID =", docId);
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
            

            /* if (!snap.exists()) {
                console.log("🔴 Je recrée le document Firestore de", user.email);
                await setDoc(ref, {
                    email: user.email,
                    role: "user"
                });

                console.log("👤 Utilisateur créé");
            } */
    }

    async function getUserRole(uid) {

        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);

        //if (!snap.exists()) return "user";
        if (!snap.exists()) return null;
        return snap.data().role;
    }
        // =========================
        // AUTH
        // =========================
        const auth = getAuth();

        onAuthStateChanged(auth, async (user) => {
       // console.log("AUTH STATE CHANGED :", user?.email || "null");

    // =========================
    // ❌ USER NON CONNECTÉ
    // =========================
    if (!user) {

        //console.log("➡ USER DECONNECTÉ");

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
    //console.log("➡ USER CONNECTÉ :", user.uid);

    try {

        // =========================
        // 👤 USER DOC
        // =========================
        await ensureUserDoc(user);

        const role = await getUserRole(user.uid);
        if (!role) {
            //console.log("🚫 utilisateur sans droits Firestore");
            await signOut(auth);
            return;
        }
        const isAdmin = role === "admin";

        //console.log("ROLE :", role);

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
        const adminBtn = document.getElementById("adminBtn");
        const span = document.getElementById("span");

        if (addBtn) addBtn.style.display = isAdmin ? "inline-block" : "none";
        if (adminBtn) adminBtn.style.display = isAdmin ? "inline-block" : "none";
        if (span) span.style.display = isAdmin ? "inline-block" : "none";

        // =========================
        // DISABLE USER ACTIONS
        // =========================
       
        document.getElementById("exportBtn").disabled = !isAdmin;
        document.getElementById("copyBtn").disabled = !isAdmin;
        document.getElementById("pasteBtn").disabled = !isAdmin;
        document.getElementById("exportFormat").disabled = !isAdmin;
        document.getElementById("brushBtn").disabled = !isAdmin;
        document.getElementById("boldBtn").disabled = !isAdmin;
        const redo=document.getElementById("redo");
        const undo=document.getElementById("undo");
        undo.disabled = !isAdmin;
        redo.disabled = !isAdmin;
        //console.log(undo);
        //console.log(undo.tagName);
        //console.log(undo instanceof HTMLButtonElement);
        //console.log(undo.disabled);


        // =========================
        // LOAD PLANNING
        // =========================
        //console.log("🚀 LOAD PLANNING START");
        await loadPlanning();
        //console.log("✅ LOAD PLANNING OK");

    } catch (err) {

        //console.error("❌ AUTH ERROR :", err);
        afficherMessageIndex("Erreur d'autentification !","error")

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
        //ajout back
        const undoBtn = document.getElementById("undo");
        const redoBtn = document.getElementById("redo");
        if (undoBtn) undoBtn.addEventListener("click", undo);
        if (redoBtn) redoBtn.addEventListener("click", redo);
        //fin ajout


        // =========================
        // LOGOUT
        // =========================
        const logoutBtn = document.getElementById("logoutBtn");

        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                await signOut(auth);
                //console.log("Déconnecté");
            });
        }
        document.getElementById("adminBtn")
        ?.addEventListener("click", () => {

            if (!window.IS_ADMIN) return;
                window.location.href = "admin.html";
        });
});
//Doc année dans base de données
async function ensureDocExists(docId) {

    if (!docId) {
        //console.warn("❌ docId manquant");
        return;
    }

    const ref = doc(db, COLLECTION, docId);

    const snap = await getDoc(ref);

    if (!snap.exists()) {
        let employes = [];
        const annee = Number(docId);
        const feries=getJoursFeriesRaw(annee);
        const pentecote = feries.find(f => f.nom === "Lundi de Pentecôte");
        let joursFeriesExclus = [
            formatDateKey(pentecote.date)
        ];
        const yearsSnap = await getDocs(collection(db, COLLECTION));

        const years = yearsSnap.docs
            .map(d => parseInt(d.id, 10))
            .filter(y => !isNaN(y))
            .sort((a, b) => b - a);

        // dernière année avant celle qu'on crée
        const previousYear = years.find(
            y => y < parseInt(docId, 10)
        );

        if (previousYear) {

            const previousSnap = await getDoc(
                doc(db, COLLECTION, String(previousYear))
            );

            if (previousSnap.exists()) {

                employes = (
                    previousSnap.data().employes || []
                ).map(emp => ({
                    id: "emp_" + crypto.randomUUID(),
                    name: emp.name
                }));
            }
        }
       
        //console.log("CREATE DOC ?", docId);
        await setDoc(ref, {
            employes,
            presence: {},
            blocs: {
                bloc1: { data: {} },
                bloc2: { data: {} },
                bloc3: { data: {} }
            },
            joursFeriesExclus
        });
    }
}
async function cleanupOldYears() {

    const currentYear = new Date().getFullYear();

    const minYear = currentYear - 3;

    const snap = await getDocs(collection(db, COLLECTION));

    await Promise.all(
        snap.docs.map(async (d) => {

            const year = parseInt(d.id, 10);

            if (isNaN(year)) return;

            if (year < minYear) {

                //console.log("🗑️ Suppression :", year);

                await deleteDoc(doc(db, COLLECTION, d.id));
            }
            
        })
    );
}
async function runYearlyCleanupOnce() {

    const currentYear = new Date().getFullYear();

    const lastCleanupYear = parseInt(
        localStorage.getItem("lastCleanupYear"),
        10
    );

    if (lastCleanupYear === currentYear) {
        return;
    }

    await cleanupOldYears();

    localStorage.setItem("lastCleanupYear", currentYear);
}

