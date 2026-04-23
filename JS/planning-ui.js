import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
import { planning } from "./planning-core.js";

export function activerDragAndDropColonnes() {

    const table = document.getElementById("planning");
    const headers = table.querySelectorAll("thead th");

    let dragIndex = null;

    headers.forEach((th, index) => {

        if (index === 0) return; // DATE

        th.draggable = true;

        // START DRAG
        th.ondragstart = (e) => {
            dragIndex = index;
        };

        // DROP
        th.ondrop = async (e) => {
            e.preventDefault();

            const targetIndex = index;

            if (dragIndex === null || dragIndex === targetIndex) return;

            const docId = window.currentDoc;
            const ref = doc(db, "planning", docId);

            // =========================
            // 1. swap employes
            // =========================
            [planning.employes[dragIndex - 1], planning.employes[targetIndex - 1]] =
            [planning.employes[targetIndex - 1], planning.employes[dragIndex - 1]];

            // =========================
            // 2. swap data Firestore
            // =========================
            for (const date in planning.data) {

                const cells = planning.data[date].cells || [];

                [cells[dragIndex - 1], cells[targetIndex - 1]] =
                [cells[targetIndex - 1], cells[dragIndex - 1]];
            }

            // =========================
            // 3. push Firestore (UNE seule fois)
            // =========================
            await updateDoc(ref, {
                employes: planning.employes,
                data: planning.data
            });

            dragIndex = null;
        };
    });
}
export function rendreHeadersInteractifs() {

    const table = document.getElementById("planning");
    const headers = table.querySelectorAll("thead th");

    headers.forEach((th, index) => {

        if (index === 0) return; // DATE

        th.contentEditable = true;
        th.style.cursor = "pointer";

        // =========================
        // RENOMMER EMPLOYÉ
        // =========================
        th.onclick = async () => {

            const nouveauNom = prompt("Nom employé :", th.textContent);

            if (!nouveauNom) return;

            planning.employes[index - 1] = nouveauNom.toUpperCase();

            await updateDoc(doc(db, "planning", window.currentDoc), {
                employes: planning.employes
            });
        };

        // =========================
        // SUPPRIMER COLONNE
        // =========================
        th.oncontextmenu = async (e) => {

            e.preventDefault();

            if (!confirm("Supprimer cet employé ?")) return;

            planning.employes.splice(index - 1, 1);

            // suppression dans toutes les lignes
            for (const date in planning.data) {

                const cells = planning.data[date].cells || [];

                cells.splice(index - 1, 1);
            }

            await updateDoc(doc(db, "planning", window.currentDoc), {
                employes: planning.employes,
                data: planning.data
            });
        };
    });
}