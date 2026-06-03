import { doc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";

export let planning = {};
let isUpdating = false;
let loading = true;
export let currentDoc = null;
export let ignoreSnapshot = false;
export const USE_MIGRATED = true;

export const COLLECTION = "planningTechniciens";
export function setIgnoreSnapshot(value) {
    ignoreSnapshot = value;
}
export function listenPlanning(docId, onUpdate) {
    
    if (!docId) return;
    currentDoc = docId;
    const ref = doc(db, COLLECTION, currentDoc);

    loading = true;

    const unsubscribe = onSnapshot(ref, (snap) => {

        if (!snap.exists()) return;
        if (isUpdating) {
            console.log("snapshot ignoré (update local)");
            return;
        }
        if (ignoreSnapshot) return;
        const data = snap.data();
        

        planning.employes = data.employes || [];
        planning.blocs = data.blocs || {};
        planning.presence = data.presence || {};

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
    if (!window.IS_ADMIN) return;
    if (!currentDoc) return;
    isUpdating = true;
    const ref = doc(db, COLLECTION, currentDoc);
    const bloc = document.getElementById("moisSelect").value;

    try {
        await updateDoc(ref, {
            [`blocs.bloc${bloc}.data.${date}.${ligne}.${emp}`]: cellData
        });
    } finally {
        
            isUpdating = false;
        
    }
}
