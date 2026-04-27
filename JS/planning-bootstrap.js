import { listenPlanning } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
import { initUI,initSelects } from "./planning-ui.js";

document.getElementById("anneeSelect").addEventListener("change", () => {
    renderPlanning();
});

document.getElementById("moisSelect").addEventListener("change", () => {
    renderPlanning();
});
function getDocId() {
    const annee = parseInt(document.getElementById("anneeSelect").value);
    const bloc = parseInt(document.getElementById("moisSelect").value);
    return `${annee}_bloc${bloc}`;
}
document.addEventListener("DOMContentLoaded", () => {
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
    // 🔥 IMPORTANT : récupérer les éléments APRES initSelects
    const anneeSelect = document.getElementById("anneeSelect");
    const moisSelect = document.getElementById("moisSelect");
     // 🔥 debug
    anneeSelect.addEventListener("change", () => {
        console.log("📅 changement année");
        loadPlanning();
    });

    moisSelect.addEventListener("change", () => {
        console.log("📦 changement bloc");
        loadPlanning();
    });

   /*  // 🔹 changement année / bloc
    document.getElementById("anneeSelect")
        .addEventListener("change", loadPlanning);
        console.log("CHANGEMENT ANNEE");

    document.getElementById("moisSelect")
        .addEventListener("change", loadPlanning); */
     // 🔹 premier chargement
    loadPlanning();
});
console.log("BOOTSTRAP CHARGÉ");

document.getElementById("anneeSelect").addEventListener("change", () => {
    console.log("🔥 ANNEE CHANGE");
});

document.getElementById("moisSelect").addEventListener("change", () => {
    console.log("🔥 MOIS CHANGE");
});
