import { renderPlanning, renderPresence } from "./planning-render.js";
import { activerDragAndDropColonnes, rendreHeadersInteractifs } from "./planning-ui.js";

/**
 * 🔵 Fonction centrale de refresh
 */
export function refreshPlanning() {

    console.log("♻️ refreshPlanning");
    renderPlanning(); // construit DOM

    // ⚠️ éviter double binding
    setTimeout(() => {

        rendreHeadersInteractifs();
        activerDragAndDropColonnes();

        renderPresence();

    }, 0);
}  