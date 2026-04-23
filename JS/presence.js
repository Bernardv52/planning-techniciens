import { doc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";
import { user } from "./auth.js";

export async function setEditing(cellId) {

    const ref = doc(db, "planning", window.currentDoc);

    await updateDoc(ref, {
        [`presence.${user.id}`]: {
            name: user.name,
            color: user.color,
            editing: cellId,
            lastSeen: serverTimestamp()
        }
    });
}

export async function clearEditing() {

    const ref = doc(db, "planning", window.currentDoc);

    await updateDoc(ref, {
        [`presence.${user.id}.editing`]: null,
        [`presence.${user.id}.lastSeen`]: serverTimestamp()
    });
}