import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./APIS/firebase.js";
import { currentDoc, planning } from "./planning-core.js";
import { renderPlanning } from "./planning-render.js";
//let isDraggingColumn = false;
let dragIndex = null;
export function activerDragAndDropColonnes() {
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

    /* const table = document.getElementById("planning");
    const headers = table.querySelectorAll("thead th");

    let dragIndex = null;

    headers.forEach((th, index) => {

        if (index === 0) return;

        th.draggable = true;

        th.ondragstart = () => {
           // isDraggingColumn = true;
            dragIndex = index - 1;
            console.log("DRAG START OK; index =", dragIndex);
        };

        th.ondragover = (e) => {
            e.preventDefault();
        };

        th.ondrop = async (e) => {

            e.preventDefault();

            const targetIndex = index - 1;

            if (dragIndex === null || dragIndex === targetIndex) return;

            const ref = doc(db, "planning", currentDoc);

            const newEmployes = [...planning.employes];

            // swap employés
            [newEmployes[dragIndex], newEmployes[targetIndex]] =
            [newEmployes[targetIndex], newEmployes[dragIndex]];

            const newBlocs = JSON.parse(JSON.stringify(planning.blocs));

            for (const blocKey in newBlocs) {

                const bloc = newBlocs[blocKey].data;

                for (const date in bloc) {

                    const lignes = bloc[date];
                    if (!lignes || !lignes[0] || !lignes[1]) continue;

                    const l0 = lignes[0];
                    const l1 = lignes[1];

                    const a0 = l0[dragIndex] ?? null;
                    const b0 = l0[targetIndex] ?? null;

                    const a1 = l1[dragIndex] ?? null;
                    const b1 = l1[targetIndex] ?? null;

                    l0[dragIndex] = b0;
                    l0[targetIndex] = a0;

                    l1[dragIndex] = b1;
                    l1[targetIndex] = a1;
                }
            }
           await setDoc(ref, {
            employes: newEmployes,
            blocs: newBlocs
        }, { merge: true });

        };
    }); */
}
export function rendreHeadersInteractifs() {

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
                const nouveauNom = prompt("Nom employé :", th.textContent);

        if (!nouveauNom) return;

        const newEmployes = [...planning.employes];
        newEmployes[index - 1] = nouveauNom.toUpperCase();

        const ref = doc(db, "planning", currentDoc);

        await setDoc(ref, {
            employes: newEmployes
        }, { merge: true });

        planning.employes = newEmployes;
        renderPlanning();

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

            /* for (const blocKey in newBlocs) {

                const bloc = newBlocs[blocKey].data;

                for (const date in bloc) {

                    const lignes = bloc[date];

                    //if (!lignes) continue;
                    if (!lignes || !lignes[0] || !lignes[1]) continue;

                    // 🔥 suppression par nom (clé objet)
                    // 🔥 ligne 0
                /*  if (lignes[0] && typeof lignes[0] === "object") {
                        delete lignes[0][nomUpper];
                    }

                    // 🔥 ligne 1 (si existe)
                    if (lignes[1] && typeof lignes[1] === "object") {
                        delete lignes[1][nomUpper];
                
                // 🔥 SAFE delete by index (OK si structure array)
                if (Array.isArray(lignes[0])) {
                    lignes[0].splice(index, 1);
                    lignes[1].splice(index, 1);
                }
                }
            } */
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
            //ajout
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
            //fin ajout

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
