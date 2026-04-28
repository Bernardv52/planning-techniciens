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
    function getDocId() {
        const annee = parseInt(document.getElementById("anneeSelect").value);
        const bloc = parseInt(document.getElementById("moisSelect").value);
        return `${annee}`;
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

    document.getElementById("anneeSelect").addEventListener("change", loadPlanning);
    document.getElementById("moisSelect").addEventListener("change", loadPlanning);

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
            data: {},
            presence: {}
        });
    }
}
