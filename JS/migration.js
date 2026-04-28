import { db } from "./APIS/firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function migratePlanning() {

    const annee = 2026;

    const blocs = [1, 2, 3];

    const newRef = doc(db, "planning", `${annee}`);

    let newData = {
        employes: [],
        blocs: {},
        presence: {}
    };

    for (const bloc of blocs) {

        const oldId = `${annee}_bloc${bloc}`;
        const oldRef = doc(db, "planning", oldId);
        const snap = await getDoc(oldRef);

        if (snap.exists()) {
            const data = snap.data();

            console.log("migration bloc :", bloc);

            newData.blocs[`bloc${bloc}`] = {
                data: data.data || {}
            };

            // 👉 on récupère les employés (si présents)
            if (data.employes && data.employes.length > 0) {
                newData.employes = data.employes;
            }

            // 👉 présence (si existe)
            if (data.presence) {
                newData.presence = {
                    ...newData.presence,
                    ...data.presence
                };
            }
        }
    }

    await setDoc(newRef, newData);

    console.log("✅ migration terminée :", newData);
}

migratePlanning();