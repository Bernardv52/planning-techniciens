import { listenPlanning } from "./planning-core.js";
import { renderPlanning } from "./planning-render.js";

document.addEventListener("DOMContentLoaded", () => {

    const annee = new Date().getFullYear();
    const bloc = 1;

    const docId = `${annee}_bloc${bloc}`;

    console.log("🚀 Initialisation planning :", docId);

    listenPlanning(docId, () => {
        console.log("🔄 Mise à jour planning reçue");
        renderPlanning();
    });

});
