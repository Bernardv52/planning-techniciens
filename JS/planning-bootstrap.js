import { listenPlanning } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
import { initUI,initSelects } from "./planning-ui.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

        unsubscribe = listenPlanning(docId, () => {
            refreshPlanning();
        });
        loading = false;
    }
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

    // 🔹 premier chargement
    loadPlanning();
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
