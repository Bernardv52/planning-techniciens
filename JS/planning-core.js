import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";
export let planning = {};
let isUpdating = false;
let loading = true;
export let currentDoc = null;
export let ignoreSnapshot = false;
export function setIgnoreSnapshot(value) {
    ignoreSnapshot = value;
}
export function listenPlanning(docId, onUpdate) {

    currentDoc = docId;

    const ref = doc(db, "planning", docId);

    loading = true;

    const unsubscribe = onSnapshot(ref, (snap) => {

        if (!snap.exists()) return;
        if (isUpdating) return;
        if (ignoreSnapshot) return;
        const data = snap.data();
        

        planning = {
        employes: data.employes || [],
        blocs: data.blocs || {},
        presence: data.presence || {}
        };

        loading = false;

        // 🔥 SEUL POINT DE RENDER AUTOMATIQUE
        //onUpdate(planning);


        loading = false;
        console.log("🔥 SNAPSHOT DATA:", data);
        console.log("📦 PLANNING FINAL:", planning);
        onUpdate(planning);
    });

    //return unsubscribe;
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