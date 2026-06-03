import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";
import { currentDoc, COLLECTION, planning } from "./planning-core.js";
import { renderPlanning } from "./planning-render.js";
import { cleanOrphanEmployees } from "./planning-edit.js";
//let isDraggingColumn = false;
let dragIndex = null;
export function activerDragAndDropColonnes() {
    if (!window.IS_ADMIN) return;
    const table = document.getElementById("planning");

    if (!table) return;

    const headers = table.querySelectorAll("thead th");

    //let dragIndex = null;

    headers.forEach((th, index) => {

        // ignorer DATE
        if (index === 0) return;

        th.draggable = true;

        th.ondragstart = () => {

           dragIndex = planning.employes.findIndex(
            e => e.id === th.dataset.empId
        );

            console.log("🚀 DRAG START :", dragIndex);
        };

        th.ondragover = (e) => {
            e.preventDefault();
        };

        th.ondrop = async (e) => {

            e.preventDefault();

             const targetEmpId = th.dataset.empId;

            if (!dragIndex || !targetEmpId) return;


            try {

                const ref = doc(db, COLLECTION, currentDoc);

                // =========================
                // SWAP EMPLOYÉS UNIQUEMENT
                // =========================

                const newEmployes = structuredClone(planning.employes);
                // employé drag
                const draggedEmp = newEmployes[dragIndex];
                if (!draggedEmp) return;

                // index cible réel via ID
                const targetIndex =
                    newEmployes.findIndex(
                        e => e.id === targetEmpId
                    );

                if (
                    targetIndex === -1 ||
                    targetIndex === dragIndex
                ) return;

                // =========================
                // SWAP
                // =========================

                [
                    newEmployes[dragIndex],
                    newEmployes[targetIndex]
                ] = [
                    newEmployes[targetIndex],
                    newEmployes[dragIndex]
                ];

                // =========================
                // SAVE FIRESTORE
                // =========================

                await setDoc(ref, {
                    employes: newEmployes
                }, { merge: true });

                // =========================
                // LOCAL SYNC
                // =========================
                planning.employes = newEmployes;

                renderPlanning();

                console.log("✅ Drag & Drop OK");

            } catch (err) {

                console.error(
                    "❌ Erreur drag and drop :",
                    err
                );
            }

            dragIndex = null;
        };
    });

}
export function rendreHeadersInteractifs() {
   if (!window.IS_ADMIN) return;

    const table = document.getElementById("planning");
    if (!table) return;

    const headers = table.querySelectorAll("thead th");

    headers.forEach((th, index) => {

        if (index === 0) return;

        th.style.cursor = "pointer";
        // =========================
        // DONNÉES EMPLOYÉ
        // =========================
        const empId = th.dataset.empId;
        const empName = th.dataset.empName || "[SANS NOM]";
        console.log("HEADER =", empId, empName);
        if (!empId) return;
        // =========================
        // RENOMMER (CLICK GAUCHE)
        // =========================

           th.onclick = async () => {

            const nouveauNom = prompt(
                "Nom employé :",
                empName
            );

            if (!nouveauNom) return;

            const nouveauNomUpper =
                nouveauNom.trim().toUpperCase();

            if (nouveauNomUpper === (empName || "").toUpperCase()) return;

            const ref = doc(db, COLLECTION, currentDoc);

            // 🔥 FIRESTORE = SOURCE UNIQUE
            const snap = await getDoc(ref);
            const data = snap.data();

            if (!data?.employes) return;

            // =========================
            // MAJ EMPLOYÉS
            // =========================
            const newEmployes =
                structuredClone(data.employes);

            const target = newEmployes.find(
                e => e.id === empId
            );

            if (!target) return;

            // 🔥 SEUL LE NOM CHANGE
            target.name = nouveauNomUpper;

            // =========================
            // SAVE
            // =========================
            await setDoc(ref, {
                employes: newEmployes
            }, { merge: true });

            // =========================
            // LOCAL SYNC
            // =========================
            planning.employes = newEmployes;

            renderPlanning();
        
        };

        // =========================
        // SUPPRESSION (CLICK DROIT)
        // =========================
        th.oncontextmenu = async (e) => {
           e.preventDefault();

         if (!confirm(`Supprimer ${empName} ?`)) {
                return;
            }

        const ref = doc(db, COLLECTION, currentDoc);

        // =========================
        // FIRESTORE = SOURCE UNIQUE
        // =========================
        const snap = await getDoc(ref);
        const data = snap.data();

        if (!data?.blocs || !data?.employes) {
            console.warn("Planning invalide");
            return;
        }

        // =========================
        // EMPLOYÉS RESTANTS
        // =========================
        const newEmployes = data.employes.filter(
            e => e.id !== empId
        );
        const actEmpIds = newEmployes.map(
        e => e.id
    );

        // =========================
        // CLONE BLOCS RÉCENTS
        // =========================
        const newBlocs = structuredClone(data.blocs);

        // =========================
        // CLEAN IDS ORPHELINS
        // =========================
        cleanOrphanEmployees(newBlocs,actEmpIds);
   
        // =========================
        // SAVE FIRESTORE
        // =========================
        await setDoc(ref, {
            employes: newEmployes,
            blocs: newBlocs,
            presence: data.presence || {}
        });
        // =========================
        // SYNC LOCAL
        // =========================
        planning.employes = newEmployes;
        planning.blocs = newBlocs;
        planning.presence = data.presence || {};

        renderPlanning();

        console.log("DELETE OK :", empName);
     };
 });
     
}
export function initSelects() {

    const anneeSelect = document.getElementById("anneeSelect");
    const moisSelect = document.getElementById("moisSelect");

    const anneeActuelle = new Date().getFullYear();

    // remplir années
    for (let i = -2; i <= 2; i++) {
        const y = anneeActuelle + i;
        const opt = document.createElement("option");
        opt.value = y;
        opt.textContent = y;

        if (i === 0) opt.selected = true;

        anneeSelect.appendChild(opt);
    }

   

    // =========================
    // DEFAULT SAFE (IMPORTANT)
    // =========================
    if (!localStorage.getItem("annee")) {
        anneeSelect.value = anneeActuelle;
    }

    if (!localStorage.getItem("bloc")) {
        moisSelect.value = "1";
    }
}
// =========================
// REFRESH SELECT EMPLOYÉS
// =========================
export function refreshEmployeSelect() {

    const select =
        document.getElementById("removeEmployeSelect");

    if (!select || !planning.employes) return;

    select.innerHTML = "";

    planning.employes.forEach(emp => {

        const option = document.createElement("option");

        option.value = emp.id;
        option.textContent =  emp.name || "[SANS NOM]";

        select.appendChild(option);
    });
}
export function initUI() {
    //if (!window.IS_ADMIN) return;
    // 🔵 AJOUT TECH
    const addBtn = document.getElementById("addEmploye");
    if (addBtn) {
        addBtn.onclick = async () => {
            const nom = prompt("Nom du technicien ?");

        if (!nom) return;

        const ref = doc(db, COLLECTION, currentDoc);

        // 🔥 ID UNIQUE
        const empId =
            "emp_" + crypto.randomUUID();

        // 🔥 nouvel employé format objet
        const nouveaux = [
            ...planning.employes,
            {
                id: empId,
                name: nom.toUpperCase()
            }
        ];

        await setDoc(ref, {
            employes: nouveaux
        }, { merge: true });

        planning.employes = nouveaux;

        renderPlanning();
        };
    }

    // 🔴 SUPPRESSION TECH
   const select = document.getElementById("removeEmployeSelect");
   const deleteBtn = document.getElementById("deleteEmployeBtn");
   console.log("deleteBtn =", deleteBtn);
console.log("select =", select);

if (select && deleteBtn) {

    // =========================
    // REMPLIR LE SELECT
    // =========================
    select.innerHTML = "";
    if (!planning?.employes?.length) return;

        planning.employes.forEach(emp => {

            const option = document.createElement("option");

            option.value = emp.id;
            option.textContent = emp.name;

            select.appendChild(option);
    });
    deleteBtn.onclick = async () => {
        const empId = select.value;

        if (!empId) return;
        const ref = doc(db, COLLECTION, currentDoc);

        // =========================
        // FIRESTORE SOURCE UNIQUE
        // =========================
        const snap = await getDoc(ref);
        const data = snap.data();


        if (!data?.blocs || !data?.employes) {
            console.warn("Planning invalide");
            return;
        }

        // =========================
        // EMPLOYÉ À SUPPRIMER
        // =========================
        const empObj = data.employes.find(e => e.id === empId);
        const empName = empObj?.name || empId;

        if (!confirm(`Supprimer ${empName} ?`)) return;

        // =========================
        // EMPLOYÉS RESTANTS
        // =========================
        const nouveaux = data.employes.filter(e => e.id !== empId);

        const activeEmpIds = nouveaux.map(e => e.id);
        

        // =========================
        // CLONE BLOCS
        // =========================
        const newBlocs = structuredClone(data.blocs);
      
        // =========================
        //CLEAN IDS ORPHELINS
        // =========================
        cleanOrphanEmployees(newBlocs, activeEmpIds);

        // =========================
        // SAVE FIRESTORE
        // =========================
        await setDoc(ref, {
            employes: nouveaux,
            blocs: newBlocs,
            presence: data.presence || {}
        });
        
        // =========================
        // LOCAL SYNC
        // =========================
        planning.employes = nouveaux;
        planning.blocs = newBlocs;
        planning.presence = data.presence || {};

        renderPlanning();

 };

}


}
