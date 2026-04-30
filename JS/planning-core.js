import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";
export let planning = {};
export let isUpdating = false;
export let loading = true;

export let currentDoc = null;

export function listenPlanning(docId, onUpdate) {

    currentDoc = docId;

    const ref = doc(db, "planning", docId);

    loading = true;

    const unsubscribe = onSnapshot(ref, (snap) => {

        if (!snap.exists()) return;
        if (isUpdating) return;

        const data = snap.data();

       
        if (!data) return;

        planning = {
            employes: Array.isArray(data.employes) ? data.employes : [],
            blocs: {
                bloc1: data.blocs?.bloc1 ?? { data: {} },
                bloc2: data.blocs?.bloc2 ?? { data: {} },
                bloc3: data.blocs?.bloc3 ?? { data: {} }
            },
            presence: data.presence ?? {}
        };

        loading = false;
        console.log("🔥 SNAPSHOT DATA:", data);
        console.log("👥 EMPLOYES RAW:", data.employes);
        console.log("📦 PLANNING FINAL:", planning);
        onUpdate(planning);
    });

    return unsubscribe;
}

export async function updateCell(date, ligne, emp, cellData) {

    isUpdating = true;

    const ref = doc(db, "planning", currentDoc);
    const bloc = document.getElementById("moisSelect").value;

    try {
        await updateDoc(ref, {
            [`blocs.bloc${bloc}.data.${date}.${ligne}.${emp}`]: cellData
        });
    } finally {
        setTimeout(() => {
            isUpdating = false;
        }, 50);
    }
}