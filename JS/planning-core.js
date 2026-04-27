import { doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";

export let planning = {};
export function listenPlanning(docId, onUpdate) {

    window.currentDoc = docId;

    const ref = doc(db, "planning", docId);

    const unsubscribe = onSnapshot(ref, async (snap) => {

        let data = {};

        // 🔥 SI LE DOCUMENT N'EXISTE PAS → ON LE CRÉE
        if (!snap.exists()) {

            console.log("⚠️ Aucun planning → initialisation...");

            const defaultData = {
                employes: [],
                data: {},
                presence: {}
            };

            await setDoc(ref, defaultData);

            data = defaultData;

        } else {
            data = snap.data();
        }

        planning = {
            employes: Array.isArray(data.employes)
                ? data.employes
                : planning.employes || [],
            data: data.data || {},
            presence: data.presence || {}
        };

        console.log("planning chargé :", planning);

        onUpdate(planning);
    });

    return unsubscribe; // 🔥 ICI LA CORRECTION CRITIQUE
    
}

export async function updateCell(date, ligne, col, cellData) {

    const ref = doc(db, "planning", window.currentDoc);

    await updateDoc(ref, {
        [`data.${date}.${ligne}.${col}`]: cellData
    });
}
