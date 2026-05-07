import { renderPlanning, renderPresence } from "./planning-render.js";
import { activerDragAndDropColonnes, rendreHeadersInteractifs } from "./planning-ui.js";

/**
 * 🔵 Fonction centrale de refresh
 */
export function refreshPlanning() {

    console.log("♻️ refreshPlanning");
    renderPlanning(); // construit DOM

    // ⚠️ éviter double binding
    requestAnimationFrame(() => {

        rendreHeadersInteractifs();
        activerDragAndDropColonnes();

        renderPresence();


    });
} 
export function autoResizeHeaders() {
    const headers = document.querySelectorAll("#planning thead th");

    headers.forEach(th => {

        const original = th.dataset.original || th.textContent;
        th.dataset.original = original;

        // 🔥 RESET OBLIGATOIRE
        th.textContent = original;
        th.style.fontSize = "16px";

        let fontSize = 16;

        // =========================
        // 1. RÉDUCTION SI NECESSAIRE
        // =========================
        while (
            th.scrollWidth > th.clientWidth &&
            fontSize > 10
        ) {
            fontSize--;
            th.style.fontSize = fontSize + "px";
        }

        // =========================
        // 2. SI TOUJOURS TROP GRAND → ABRÉVIATION
        // =========================
        if (th.scrollWidth > th.clientWidth) {
            th.textContent = abbreviateName(original);

            // 🔥 reset taille pour recalcul abrégé
            fontSize = 16;
            th.style.fontSize = fontSize + "px";

            while (
                th.scrollWidth > th.clientWidth &&
                fontSize > 7
            ) {
                fontSize--;
                th.style.fontSize = fontSize + "px";
            }
        }
    });
} 
function abbreviateName(name) {

    if (name.length <= 6) return name;

    // ex: CHRISTOPHE → CHRIS
    return name.slice(0, 5).toUpperCase();
}