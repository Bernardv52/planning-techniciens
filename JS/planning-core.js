import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

export let planning = {};
export function listenPlanning(docId, onUpdate) {

    window.currentDoc = docId;

    const ref = doc(db, "planning", docId);

    onSnapshot(ref, (snap) => {

        let data = {};

        if (snap.exists()) {
            data = snap.data();
        }

        planning = {
            employes: Array.isArray(data.employes) ? data.employes : [],
            data: data.data || {},
            presence: data.presence || {}
        };

        console.log("planning chargé :", planning);

        onUpdate(planning);
    });
}

/* export function listenPlanning(docId, onUpdate) {

    window.currentDoc = docId;

    const ref = doc(db, "planning", docId);

    onSnapshot(ref, (snap) => {

        if (snap.exists()) {
            //planning = snap.data();
        } else {
            planning = {
                employes: [],
                data: {},
                presence: {}
            };
        }

        onUpdate(planning);
    });
} */

export async function updateCell(date, col, value) {

    const ref = doc(db, "planning", window.currentDoc);

    await updateDoc(ref, {
        [`data.${date}.cells.${col}`]: value
    });
}