import { renderPlanning, renderPresence } from "./planning-render.js";
import { activerDragAndDropColonnes, rendreHeadersInteractifs } from "./planning-ui.js";
/**
 * 🔵 Fonction centrale de refresh
 */
export function refreshPlanning() {

    // 1️⃣ Rendu DOM
    renderPlanning();

    // 2️⃣ UI (interactions)
    rendreHeadersInteractifs();
    activerDragAndDropColonnes();

    // 3️⃣ Présence (multi-user)
    renderPresence();
}