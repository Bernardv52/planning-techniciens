import { listenPlanning } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
import { initUI } from "./planning-ui.js";

document.getElementById("anneeSelect").addEventListener("change", () => {
    renderPlanning();
});

document.getElementById("moisSelect").addEventListener("change", () => {
    renderPlanning();
});
document.addEventListener("DOMContentLoaded", () => {
    initUI();
    const annee = new Date().getFullYear();
    const bloc = 1;

    const docId = `${annee}_bloc${bloc}`;

    console.log("🚀 Initialisation planning :", docId);

    listenPlanning(docId, () => {
        console.log("🔄 Mise à jour planning reçue");
        refreshPlanning();

    });

});
