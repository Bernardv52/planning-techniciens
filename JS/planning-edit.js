import { renderPlanning, renderPresence } from "./planning-render.js";
import { activerDragAndDropColonnes, rendreHeadersInteractifs } from "./planning-ui.js";
//rajout
//import { planning } from "./planning-core.js";
/**
 * 🔵 Fonction centrale de refresh
 */
export function refreshPlanning() {

    //rajout
   /*  if (!planning.employes || planning.employes.length === 0) {
        console.log("⏳ attente données Firestore");
        return;
    } */
    //fin du rajout
    console.log("♻️ refreshPlanning");
    renderPlanning(); // construit DOM

    // ⚠️ éviter double binding
    setTimeout(() => {

        rendreHeadersInteractifs();
        activerDragAndDropColonnes();

        renderPresence();

    }, 0);
}  