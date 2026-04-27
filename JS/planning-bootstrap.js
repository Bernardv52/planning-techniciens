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

    function loadPlanning() {

        const docId = getDocId();

        console.log("🚀 Chargement planning :", docId);

        if (unsubscribe) unsubscribe();

        unsubscribe = listenPlanning(docId, () => {
            console.log("🔄 Mise à jour planning reçue");
            refreshPlanning();
        });
    }

    // 🔹 premier chargement
    loadPlanning();

    // 🔹 changement année / bloc
    document.getElementById("anneeSelect")
        .addEventListener("change", loadPlanning);

    document.getElementById("moisSelect")
        .addEventListener("change", loadPlanning);

});
