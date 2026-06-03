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
const auth = getAuth();
const secondaryApp = initializeApp(
    firebaseConfig,
    "Secondary"
);

const secondaryAuth = getAuth(secondaryApp);

console.log("🔥 ADMIN JS CHARGÉ");

// =========================
// LOAD USERS
// =========================
async function loadUsers() {

    console.log("LOAD USERS");

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

            tdEmail.textContent = data.email || "";

            // =========================
            // ROLE
            // =========================
            const tdRole = document.createElement("td");

            const select = document.createElement("select");

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
            // ACTION
            // =========================
            const tdAction = document.createElement("td");

            const btn = document.createElement("button");

            btn.textContent = "Sauvegarder";

            btn.addEventListener("click", async () => {

                try {

                    await updateDoc(
                        doc(db, "users", userDoc.id),
                        {
                            role: select.value
                        }
                    );

                    alert("Rôle mis à jour");

                } catch (err) {

                    console.error(err);

                    alert("Erreur mise à jour rôle");
                }
            });
            tdAction.appendChild(btn);
            // =========================
            // DELETE BUTTON
            // =========================
            const tdDelete = document.createElement("td");
            const delBtn = document.createElement("button");
            delBtn.textContent = "Supprimer";
            delBtn.style.backgroundColor = "red";
            delBtn.style.color = "white";

            delBtn.addEventListener("click", async () => {

                const confirmDelete = confirm(
                    `Supprimer ${data.email} ?`
                );

                if (!confirmDelete) return;

                try {

                    // 🔥 suppression Firestore user
                    await deleteDoc(doc(db, "users", userDoc.id));

                    alert("Utilisateur supprimé");

                    // 🔄 refresh tableau
                    loadUsers();

                } catch (err) {

                    console.error(err);
                    alert("Erreur suppression user");
                }
            });

            tdDelete.appendChild(delBtn);
            // =========================
            // APPEND
            // =========================
            tr.appendChild(tdEmail);
            tr.appendChild(tdRole);
            tr.appendChild(tdAction);
            tr.appendChild(tdDelete);
            tbody.appendChild(tr);
        });

        console.log("✅ USERS CHARGÉS");

    } catch (err) {

        console.error(
            "FIRESTORE ERROR FULL:",
            err.code,
            err.message
        );
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

        alert(
            "Utilisateur créé !"
        );
        location.reload()


    } catch (err) {

        console.error(err);

        alert("Erreur création user");
    }
});

// =========================
// INIT
// =========================
await loadUsers();
