import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";

export let planning = {};
export function listenPlanning(docId, onUpdate) {

    window.currentDoc = docId;

    const ref = doc(db, "planning", docId);

    const unsubscribe = onSnapshot(ref, (snap) => {

        if (!snap.exists()) {
            console.warn("⚠️ doc vide");
            return;
        }

        const data = snap.data();

        planning = {
            employes: Array.isArray(data.employes) && data.employes.length > 0
                ? data.employes
                : planning.employes || [],

            data: data.data || {},
            presence: data.presence || {}
        };

        console.log("planning chargé :", planning);

        onUpdate(planning);
    });

    return unsubscribe;   
}

export async function updateCell(date, ligne, col, cellData) {

    const ref = doc(db, "planning", window.currentDoc);

    await updateDoc(ref, {
        [`data.${date}.${ligne}.${col}`]: cellData
    });
}
