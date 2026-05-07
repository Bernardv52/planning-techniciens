import { db } from "./APIS/firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
//Dans la console du navigateur lancer : await migratePlanning("2024");
export async function migratePlanning(docId) {
    const ref = doc(db, "planning", docId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
        console.log("❌ Document introuvable");
        return;
    }

    const data = snap.data();

    const employes = data.employes || [];
    const blocs = data.blocs || {};
    const presence= data.presence || {};

    console.log("🚀 MIGRATION EN COURS...");

    for (const blocKey in blocs) {

        const bloc = blocs[blocKey].data;

        for (const date in bloc) {

            const lignes = bloc[date];

            if (!lignes || !lignes[0] || !lignes[1]) continue;

            // =========================
            // 🔥 CONVERTIR TABLEAU → OBJET
            // =========================
            for (let i = 0; i < 2; i++) {

                if (Array.isArray(lignes[i])) {

                    const newObj = {};

                    lignes[i].forEach((val, index) => {

                        const emp = employes[index];

                        if (!emp) return;

                        newObj[emp] = val || {
                            html: "",
                            bg: "",
                            color: "",
                            weight: ""
                        };
                    });

                    lignes[i] = newObj;
                }
            }
        }
    }

    // =========================
    // 🔥 SAVE
    // =========================
    await setDoc(ref, {
        employes,
        blocs,
        presence
    }, { merge: true });
    console.log("✅ MIGRATION TERMINÉE");
    /* const annee = 2026;

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

    console.log("✅ migration terminée :", newData); */
}
window.migratePlanning = migratePlanning;

