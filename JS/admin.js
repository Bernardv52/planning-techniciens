import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
    initializeApp
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { createUserWithEmailAndPassword, getAuth } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { db,firebaseConfig } from "./APIS/firebase.js";
import { getJoursFeriesRaw,formatDateKey } from "./planning-utils.js";
import { formatDate } from "./planning-render.js";
import { COLLECTION } from "./planning-core.js";
import { refreshPlanning } from "./planning-edit.js";
const auth = getAuth();
const secondaryApp = initializeApp(
    firebaseConfig,
    "Secondary"
);

const secondaryAuth = getAuth(secondaryApp);
const holidayYear = document.getElementById("holidayYear");
const holidayBody = document.getElementById("holidayBody");
const saveHolidaysBtn = document.getElementById("saveHolidaysBtn");
const retourPlanningBtn = document.getElementById("retourPlanningBtn");
const anneeActuelle = new Date().getFullYear();
function afficherMessage(texte, type ) {

    const msg = document.getElementById("message");

    msg.textContent = texte;
    msg.className = type;
    msg.style.display = "block";

    setTimeout(() => {
        msg.style.display = "none";
    }, 4000);
}
//console.log("🔥 ADMIN JS OK");
function initHolidayConfig() {
    remplirListeAnnees();
    afficherJoursFeries();
}
function remplirAnnees() {

    holidayYear.innerHTML = "";

    const anneeActuelle = new Date().getFullYear();
    const saved = localStorage.getItem("holidayYear");

    for (let i = 0; i <= 2; i++) {
        const annee = anneeActuelle + i;
        const option = document.createElement("option");
        option.classList.add("list");
        option.value = annee
        option.textContent = annee

        if (saved && Number(saved) === annee) {
            option.selected = true;
        }


        holidayYear.appendChild(option);
    }
    if (!saved) {
        holidayYear.value = anneeActuelle;
    }
}
// =========================
// JOURS FÉRIÉS
// =========================
async function afficherJoursFeries() {

    holidayBody.innerHTML = "";

    const annee = Number(holidayYear.value);

    const feries = getJoursFeriesRaw(annee);
    const snap = await getDoc(doc(db, COLLECTION, String(annee)));
    const data = snap.exists() ? snap.data() : {};
    const exclus = data.joursFeriesExclus || [];

    feries.forEach(item => {

        const tr = document.createElement("tr");

        // Colonne "Actif"
        const tdCheck = document.createElement("td");
        tdCheck.classList.add("tdcheck");
        const check = document.createElement("input");
        check.classList.add("check");
        check.type = "checkbox";
        check.dataset.date = formatDateKey(item.date);
       

        check.checked = !exclus.includes(formatDateKey(item.date));

        tdCheck.appendChild(check);

        // Colonne "Jour férié"
        const tdDate = document.createElement("td");
        tdDate.classList.add("lignes");
        tdDate.textContent = formatDate(item.date);
         // Colonne "Nom férié"
        const tdNom = document.createElement("td");
        tdNom.classList.add("lignes");
        tdNom.textContent = item.nom;
        tr.appendChild(tdCheck);
        tr.appendChild(tdDate);
        tr.appendChild(tdNom);
        holidayBody.appendChild(tr);

    });

}
async function sauvegarderJoursFeries() {

    const annee = Number(holidayYear.value);

    // 1. récupérer les jours fériés exclus
    const joursFeriesExclus = [];

    document.querySelectorAll("#holidayBody input[type='checkbox']")
        .forEach(check => {

            if (!check.checked) {
                joursFeriesExclus.push(check.dataset.date);
            }
        });

    //console.log("Jours fériés actifs :", joursFeriesExclus);

    // 2. charger le planning de l'année
    const ref = doc(db, COLLECTION, String(annee));

    await setDoc(ref, {
        joursFeriesExclus
    }, { merge: true });

    //console.log("✅ Jours fériés exclus sauvegardés :", joursFeriesExclus);

    refreshPlanning();
    afficherMessage(
            "Modification effectuée !","success"
        );
}

// =========================
// Évènements
// =========================

//holidayYear.addEventListener("change", afficherJoursFeries);
holidayYear.addEventListener("change", () => {
    localStorage.setItem("holidayYear", holidayYear.value);
    afficherJoursFeries();
});
saveHolidaysBtn.addEventListener("click", sauvegarderJoursFeries);

retourPlanningBtn?.addEventListener("click", () => {
    window.location.href = "index.html";
});

// =========================
// LOAD USERS
// =========================
async function loadUsers() {

    //console.log("LOAD USERS");

    const tbody = document.querySelector("#usersTable tbody");

    tbody.innerHTML = "";

    try {

        const snap = await getDocs(collection(db, "users"));

        snap.forEach(userDoc => {

            const data = userDoc.data();

            const tr = document.createElement("tr");
            

            // =========================
            // EMAIL
            // =========================
            const tdEmail = document.createElement("td");
            tdEmail.classList.add("lignes");

            tdEmail.textContent = data.email || "";

            // =========================
            // ROLE
            // =========================
            const tdRole = document.createElement("td");

            const select = document.createElement("select");
            select.classList.add("roleSelect");

            ["admin", "user"].forEach(role => {

                const option = document.createElement("option");

                option.value = role;
                option.textContent = role;

                if (data.role === role) {
                    option.selected = true;
                }

                select.appendChild(option);
               
            });

            tdRole.appendChild(select);
           

            // =========================
            // SAVE BUTTON
            // =========================
            const tdSave = document.createElement("td");

            const btn = document.createElement("button");

            btn.textContent = "Sauvegarder";
            btn.classList.add("saveBtn");
            btn.addEventListener("click", async () => {

                try {

                    await updateDoc(
                        doc(db, "users", userDoc.id),
                        {
                            role: select.value
                        }
                    );

                    afficherMessage("Rôle mis à jour avec succès !","success");

                } catch (err) {

                    //console.error(err);

                    afficherMessage("Erreur mise à jour du rôle","error");
                }
            });
            tdSave.appendChild(btn);
            // =========================
            // DELETE BUTTON
            // =========================
            const tdDelete = document.createElement("td");
            const delBtn = document.createElement("button");
            delBtn.textContent = "Supprimer";
            delBtn.classList.add("deleteBtn");

            delBtn.addEventListener("click", async () => {

                const confirmDelete = confirm(
                    `Supprimer ${data.email} ?`
                );

                if (!confirmDelete) return;

                try {

                    // 🔥 suppression Firestore user
                    await deleteDoc(doc(db, "users", userDoc.id));

                    afficherMessage("Utilisateur supprimé avec succès !","success");

                    // 🔄 refresh tableau
                    await loadUsers();

                } catch (err) {

                    //console.error(err);
                    afficherMessage("Erreur suppression user","error");
                }
            });

            tdDelete.appendChild(delBtn);
            // =========================
            // APPEND
            // =========================
            tr.appendChild(tdEmail);
            tr.appendChild(tdRole);
            tr.appendChild(tdSave);
            tr.appendChild(tdDelete);
            tbody.appendChild(tr);
        });

        //console.log("✅ USERS CHARGÉS");

    } catch (err) {
        afficherMessage(
            "Une erreur est survenue !",
            "error"
        );

        /* console.error(
            "FIRESTORE ERROR FULL:",
            err.code,
            err.message
        ); */
    }
}

// =========================
// ADD USER BUTTON
// =========================
document.getElementById("addUserBtn")
?.addEventListener("click", async () => {

    const email = prompt("Email utilisateur ?");
    if (!email) return;

    const password = prompt("Mot de passe ?");
    if (!password) return;
    if (password.length < 6) {
        afficherMessage(
            "Le mot de passe doit contenir au moins 6 caractères !",
            "error"
        );
        return;
    }

    try {

        // =========================
        // CREATE AUTH USER
        // =========================
        const cred =
            await createUserWithEmailAndPassword(
                secondaryAuth,
                email,
                password
            );

        // =========================
        // CREATE FIRESTORE USER
        // =========================
        await setDoc(
            doc(db, "users", cred.user.uid),
            {
                email,
                role: "user"
            }
        );

        afficherMessage("Utilisateur créé avec succès !","success");
        await loadUsers();

    } catch (err) {

        //console.error(err);

      afficherMessage("Erreur à la création de l'identifiant !","error");
    }
});

// =========================
// INIT
// =========================
async function initAdmin() {
    remplirAnnees();
    await afficherJoursFeries();
    await loadUsers();
}
initAdmin();