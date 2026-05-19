import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";
import { currentDoc, planning } from "./planning-core.js";
import { renderPlanning } from "./planning-render.js";
//let isDraggingColumn = false;
let dragIndex = null;
export function activerDragAndDropColonnes() {
    if (!window.IS_ADMIN) return;
    const table = document.getElementById("planning");

    if (!table) return;

    const headers = table.querySelectorAll("thead th");

    let dragIndex = null;

    headers.forEach((th, index) => {

        // ignorer DATE
        if (index === 0) return;

        th.draggable = true;

        th.ondragstart = () => {

            dragIndex = index - 1;

            console.log("🚀 DRAG START :", dragIndex);
        };

        th.ondragover = (e) => {
            e.preventDefault();
        };

        th.ondrop = async (e) => {

            e.preventDefault();

            const targetIndex = index - 1;

            if (
                dragIndex === null ||
                dragIndex === targetIndex
            ) return;

            try {

                const ref = doc(db, "planning", currentDoc);

                // =========================
                // SWAP EMPLOYÉS UNIQUEMENT
                // =========================

                const newEmployes = [...planning.employes];

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
    const headers = table.querySelectorAll("thead th");

    headers.forEach((th, index) => {

        if (index === 0) return;

            th.style.cursor = "pointer";

            // =========================
            // RENOMMER
            // =========================
            th.onclick = async () => {
                console.log("CLICK HEADER", index, th.textContent);
                //ajout
                const ancienNom = planning.employes[index - 1];
                const nouveauNom = prompt("Nom employé :", th.ancienNom);
                //fin ajout
                
                //const nouveauNom = prompt("Nom employé :", th.textContent);
            

        if (!nouveauNom) return;

        //ajout
        const nouveauNomUpper = nouveauNom.toUpperCase();
         // éviter renommage identique
        if (ancienNom === nouveauNomUpper) return;
        //fin ajout
         // =========================
        // MAJ EMPLOYÉS
        // =========================
        const newEmployes = [...planning.employes];
        
        //newEmployes[index - 1] = nouveauNom.toUpperCase();
        //ajout
         newEmployes[index - 1] = nouveauNomUpper;

         // =========================
        // CLONE BLOCS
        // =========================
        const newBlocs =
        JSON.parse(JSON.stringify(planning.blocs));

        // =========================
        // RENOMMER LES CLÉS
        // DANS TOUT LE PLANNING
        // =========================
        for (const blocKey in newBlocs) {

            const bloc = newBlocs[blocKey].data;

            for (const date in bloc) {

                const lignes = bloc[date];

                if (!lignes) continue;

                [0, 1].forEach(i => {

                    if (!lignes[i]) return;

                    // ancienne donnée existe ?
                    if (lignes[i][ancienNom]) {

                        // copie nouvelle clé
                        lignes[i][nouveauNomUpper] =
                            lignes[i][ancienNom];

                        // suppression ancienne clé
                        delete lignes[i][ancienNom];
                    }
                });
            }
        }
        // =========================
        // SAVE FIRESTORE
        // =========================
        const ref = doc(db, "planning", currentDoc);

        await setDoc(ref, {
            employes: newEmployes,
            blocs: newBlocs
        }, { merge: true });

        // =========================
        // SYNC LOCAL
        // =========================
        planning.employes = newEmployes;
        planning.blocs = newBlocs;

        renderPlanning();
       /*  const ref = doc(db, "planning", currentDoc);

        await setDoc(ref, {
            employes: newEmployes
        }, { merge: true });

        planning.employes = newEmployes;
        renderPlanning(); */

        };

        // =========================
        // SUPPRIMER
        // =========================
      
        th.oncontextmenu = async (e) => {
            e.preventDefault();

            const emp = (th.dataset.emp || th.textContent).toUpperCase();

            console.log("DELETE EMP:", emp);

            if (!confirm("Supprimer cet employé ?")) return;

            const ref = doc(db, "planning", currentDoc);

            const newEmployes = [...planning.employes];
            const index = newEmployes.indexOf(emp);

            if (index === -1) return;

            newEmployes.splice(index, 1);

            const newBlocs = JSON.parse(JSON.stringify(planning.blocs));

            for (const blocKey in newBlocs) {

                    const bloc = newBlocs[blocKey].data;

                    for (const date in bloc) {

                        const lignes = bloc[date];
                        if (!lignes) continue;

                        [0, 1].forEach(i => {

                            if (!lignes[i]) return;

                            // 🔥 Si ancien format tableau → on ignore
                            if (Array.isArray(lignes[i])) return;

                            // 🔥 suppression objet
                            Object.keys(lignes[i]).forEach(key => {
                                if (key.toUpperCase() === emp) {
                                    delete lignes[i][key];
                                }
                            });
                        });
                    }
                
                }

                await setDoc(ref, {
                    employes: newEmployes,
                    blocs: newBlocs,
                    presence: planning.presence || {}
                });
            
                planning.employes = newEmployes;
                planning.blocs = newBlocs;

                renderPlanning();
                console.log("APRÈS DELETE:", newBlocs);
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
export function initUI() {
    //if (!window.IS_ADMIN) return;
    // 🔵 AJOUT TECH
    const addBtn = document.getElementById("addEmploye");
    if (addBtn) {
        addBtn.addEventListener("click", async () => {
            const nom = prompt("Nom du technicien ?");
        if (!nom) return;

        const ref = doc(db, "planning", currentDoc);

        const nouveaux = [...planning.employes, nom.toUpperCase()];

        await setDoc(ref, {
            employes: nouveaux
        }, { merge: true });

        planning.employes = nouveaux;
        renderPlanning();
        });
    }

    // 🔴 SUPPRESSION TECH
    const removeBtn = document.getElementById("removeEmploye");
    if (removeBtn) {
        removeBtn.addEventListener("click", async () => {

            if (!planning.employes.length) return;

            const nom = prompt("Nom du technicien à supprimer ?");
            if (!nom) return;
            //ajout
            const nomUpper = nom.toUpperCase();
            //fin ajout
            const ref = doc(db, "planning", currentDoc);

            const index = planning.employes.indexOf(nomUpper);
            if (index === -1) return;

            const nouveaux = [...planning.employes];
            nouveaux.splice(index, 1);
             // =========================
        // 2. CLONE DES BLOCS
        // =========================
        const newBlocs = JSON.parse(JSON.stringify(planning.blocs));

        // =========================
        // 3. SUPPRESSION DES DONNÉES
        // =========================
        for (const blocKey in newBlocs) {

            const bloc = newBlocs[blocKey].data;

            for (const date in bloc) {

                const lignes = bloc[date];

                if (!lignes) continue;

                // 🔥 suppression par nom (clé objet)
                // 🔥 ligne 0
                if (lignes[0] && typeof lignes[0] === "object") {
                    delete lignes[0][nomUpper];
                }

                // 🔥 ligne 1 (si existe)
                if (lignes[1] && typeof lignes[1] === "object") {
                    delete lignes[1][nomUpper];
                }
            }
        }

            await setDoc(ref, {
                employes: nouveaux,
                blocs: newBlocs,
                presence: planning.presence || {}
            });

            // =========================
            // 5. SYNC LOCAL + RENDER
            // =========================
            planning.employes = nouveaux;
            planning.blocs = newBlocs;
            renderPlanning();
        });
    }

    // 🔐 LOGIN (simple log pour test)
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const email = document.getElementById("email").value;
            console.log("Login demandé :", email);
        });
    }

}
