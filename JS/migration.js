import { db } from "./APIS/firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { cleanOrphanEmployees } from "./planning-edit.js";
//Dans la console du navigateur lancer : await migratePlanning("2024");
  
export async function migrateYear(oldCol, newCol, docId) {

    const oldRef = doc(db, oldCol, docId);
    const snap = await getDoc(oldRef);

    if (!snap.exists()) return;

    const data = snap.data();

    console.log("📦 Migration :", docId);

    // =========================
    // 1. EMPLOYÉS (ON GARDE LES IDS EXISTANTS)
    // =========================
    const newEmployes = (data.employes || []).map(emp => ({
        id: emp.id,
        name: emp.name
    }));

    const validIds = newEmployes.map(e => e.id);

    // =========================
    // 2. BLOCS (NETTOYAGE SIMPLE + SAFE)
    // =========================
    const newBlocs = structuredClone(data.blocs || {});

    for (const blocKey in newBlocs) {

        const bloc = newBlocs[blocKey]?.data;
        if (!bloc) continue;

        for (const date in bloc) {

            const lignes = bloc[date];
            if (!lignes) continue;

            [0, 1].forEach(i => {

                const obj = lignes[i];
                if (!obj) return;

                const newObj = {};

                Object.keys(obj).forEach(key => {

                    // garde uniquement les IDs valides
                    if (validIds.includes(key)) {
                        newObj[key] = obj[key];
                    }
                });

                lignes[i] = newObj;
            });
        }
    }

    // =========================
    // 3. WRITE NEW DOC
    // =========================
    await setDoc(doc(db, newCol, docId), {
        employes: newEmployes,
        blocs: newBlocs,
        presence: data.presence || {}
    });

    console.log("✅ Migration OK :", docId);
}
export async function migrateAll() {

    const oldCol = "planning_MIGRATION_TEST";
    const newCol = "planningTechniciens";

    const years = ["2025", "2026"];

    for (const year of years) {
        await migrateYear(oldCol, newCol, year);
    }

    console.log("🎉 Migration terminée");
}

//pour l appeler dans la console
//window.migrateAll = migrateAll;
//Et pour envoyer une année en particulier : migrateYear("planningTechniciens","planning_MIGRATION_TEST","2026");
// Methode pour créer une collection directement dans firebase :
/*Méthode 1 — via la console Firebase (la plus simple)
Aller dans :
 https://console.firebase.google.com
Ouvrir le projet
Clique :
Firestore Database
Clique :
“Start collection” (ou “Ajouter une collection”)

on mets par exemple:
test
Puis on ajoute un document :
testDoc
Ajoute des champs :
message → "Firestore fonctionne "
date → "2026-04-21T07:36:22.470Z"
 Et voilà, la collection est créée automatiquement.*/

