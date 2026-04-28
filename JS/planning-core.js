import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

        const bloc = parseInt(document.getElementById("moisSelect").value);

        planning = {
            employes: data.employes || [],
            data: data.blocs?.[`bloc${bloc}`]?.data || {},
            presence: data.presence || {}
        };

        console.log("planning chargé :", planning);

        onUpdate(planning);
    });

    return unsubscribe;   
}

export async function updateCell(date, ligne, col, cellData) {
   console.log("SAVE CELL :", { date, ligne, col, cellData });

    const ref = doc(db, "planning", window.currentDoc);
    const bloc = document.getElementById("moisSelect").value;

    await updateDoc(ref, {
        [`blocs.bloc${bloc}.data.${date}.${ligne}.${col}`]: cellData
    });
}
