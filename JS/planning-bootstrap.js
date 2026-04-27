import { listenPlanning } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
import { initUI,initSelects } from "./planning-ui.js";


document.addEventListener("DOMContentLoaded", () => {

    console.log("BOOTSTRAP CHARGÉ");

    initUI();
    initSelects();

    let unsubscribe = null;

    function getDocId() {
        const annee = parseInt(document.getElementById("anneeSelect").value);
        const bloc = parseInt(document.getElementById("moisSelect").value);
        return `${annee}_bloc${bloc}`;
    }

    function loadPlanning() {

        const docId = getDocId();

        console.log("🚀 Chargement planning :", docId);

        if (unsubscribe) unsubscribe();

        unsubscribe = listenPlanning(docId, () => {
            console.log("🔄 Mise à jour planning reçue");
            refreshPlanning();
        });
    }

    // 🔹 Events propres
    document.getElementById("anneeSelect").addEventListener("change", () => {
        console.log("📅 changement année");
        loadPlanning();
    });

    document.getElementById("moisSelect").addEventListener("change", () => {
        console.log("📦 changement bloc");
        loadPlanning();
    });

    // 🔹 premier chargement
    loadPlanning();
});
