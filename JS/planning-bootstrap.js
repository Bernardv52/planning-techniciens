import { listenPlanning } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";

document.addEventListener("DOMContentLoaded", () => {

    const annee = new Date().getFullYear();
    const bloc = 1;

    const docId = `${annee}_bloc${bloc}`;

    console.log("🚀 Initialisation planning :", docId);

    listenPlanning(docId, () => {
        console.log("🔄 Mise à jour planning reçue");
        refreshPlanning();

    });

});
