import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";

export let planning = {};
export let ready = false;
export let loading = true;
export function listenPlanning(docId, onUpdate) {

    window.currentDoc = docId;

    const ref = doc(db, "planning", docId);
    loading = true;
    ready = false;
    const unsubscribe = onSnapshot(ref, (snap) => {

        if (!snap.exists()) {
            console.warn("⚠️ doc vide");
            return;
        }

        const data = snap.data();
         if (!data.employes) return; // 👈 bloque render vide
        const bloc = parseInt(document.getElementById("moisSelect").value);

        planning = {
            employes: data.employes || [],
            blocs: {
                bloc1: data.blocs?.bloc1 || { data: {} },
                bloc2: data.blocs?.bloc2 || { data: {} },
                bloc3: data.blocs?.bloc3 || { data: {} }
            },

            presence: data.presence || {}
        };

        console.log("planning chargé :", planning);
        loading = false;
        ready = true;
        onUpdate(planning);
    });

    return unsubscribe;   
}

export async function updateCell(date, ligne, emp, cellData) {
   console.log("SAVE CELL :", { date, ligne, emp, cellData });

    const ref = doc(db, "planning", window.currentDoc);

    const bloc = document.getElementById("moisSelect").value;

    await updateDoc(ref, {
        [`blocs.bloc${bloc}.data.${date}.${ligne}.${emp}`]: cellData
    });
}
