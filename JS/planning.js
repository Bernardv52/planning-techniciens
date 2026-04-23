
// ======================================================
// FIRESTORE
// ======================================================

const db = window.db;

// ======================================================
// JOURS FÉRIÉS
// ======================================================

function calculerPaques(annee) {
    const a = annee % 19;
    const b = Math.floor(annee / 100);
    const c = annee % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mois = Math.floor((h + l - 7 * m + 114) / 31);
    const jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(annee, mois - 1, jour);
}

function getJoursFeries(annee) {
    const feries = [
        new Date(annee, 0, 1),
        new Date(annee, 4, 1),
        new Date(annee, 4, 8),
        new Date(annee, 6, 14),
        new Date(annee, 7, 15),
        new Date(annee, 10, 1),
        new Date(annee, 10, 11),
        new Date(annee, 11, 25)
    ];

    const paques = calculerPaques(annee);
    const lundiPaques = new Date(paques);
    lundiPaques.setDate(paques.getDate() + 1);

    const ascension = new Date(paques);
    ascension.setDate(paques.getDate() + 39);

    feries.push(lundiPaques, ascension);

    return feries.map(d => d.toISOString().split("T")[0]);
}

// ======================================================
// GENERATION DU PLANNING
// ======================================================

let planningData = {
    employes: [],
    data: {}
};

let currentYear = new Date().getFullYear();
let currentBloc = 1;


// ======================================================
// CHARGEMENT TEMPS RÉEL FIRESTORE
// ======================================================
function listenPlanning(annee, bloc) {

    const id = `${annee}_bloc${bloc}`;
    const ref = doc(db, "planning", id);

    onSnapshot(ref, (snap) => {

        if (snap.exists()) {
            planningData = snap.data();
        } else {
            planningData = {
                employes: ["MATHIEU","ALEXANDER","LAURENT","FORMATION","CHRISTOPHE","MARC"],
                data: {}
            };
        }

        genererPlanning(annee, bloc);
    });
}


// ======================================================
// SAUVEGARDE FIRESTORE
// ======================================================
async function sauvegarderFirestore() {
    const id = `${currentYear}_bloc${currentBloc}`;
    const ref = doc(db, "planning", id);

    await setDoc(ref, planningData);
}


// ======================================================
// GENERATION DU PLANNING (UI)
// ======================================================
function genererPlanning(annee, bloc) {

    const tbody = document.querySelector("#planning tbody");
    tbody.innerHTML = "";

    const table = document.getElementById("planning");
    const headerRow = table.querySelector("thead tr");

    headerRow.innerHTML = "<th>DATE</th>";

    const employes = planningData.employes || [];

    // HEADER EMPLOYES
    employes.forEach(emp => {
        const th = document.createElement("th");
        th.textContent = emp;
        headerRow.appendChild(th);
    });

    let date = new Date(annee, 0, 1);
    const dateFin = new Date(annee, 11, 31);

    while (date <= dateFin) {

        const dateISO = date.toISOString().split("T")[0];

        const tr1 = document.createElement("tr");

        const tdDate = document.createElement("td");
        tdDate.textContent = dateISO;
        tdDate.classList.add("date-cell");
        tdDate.dataset.date = dateISO;
        tdDate.rowSpan = 2;

        tr1.appendChild(tdDate);

        // LIGNE 1
        employes.forEach((emp, idx) => {

            const td = document.createElement("td");
            td.contentEditable = true;

            const cell = planningData.data?.[dateISO]?.ligne1?.[idx];

            td.innerHTML = cell?.html || "";

            td.addEventListener("input", async () => {

                if (!planningData.data[dateISO]) {
                    planningData.data[dateISO] = {
                        ligne1: [],
                        ligne2: []
                    };
                }

                planningData.data[dateISO].ligne1[idx] = {
                    html: td.innerHTML
                };

                await sauvegarderFirestore();
            });

            tr1.appendChild(td);
        });

        tbody.appendChild(tr1);

        // LIGNE 2
        const tr2 = document.createElement("tr");

        employes.forEach((emp, idx) => {

            const td = document.createElement("td");
            td.contentEditable = true;

            const cell = planningData.data?.[dateISO]?.ligne2?.[idx];

            td.innerHTML = cell?.html || "";

            td.addEventListener("input", async () => {

                if (!planningData.data[dateISO]) {
                    planningData.data[dateISO] = {
                        ligne1: [],
                        ligne2: []
                    };
                }

                planningData.data[dateISO].ligne2[idx] = {
                    html: td.innerHTML
                };

                await sauvegarderFirestore();
            });

            tr2.appendChild(td);
        });

        tbody.appendChild(tr2);

        date.setDate(date.getDate() + 1);
    }

    rendreHeadersInteractifs();
}


// ======================================================
// HEADERS INTERACTIFS
// ======================================================
function rendreHeadersInteractifs() {

    const table = document.getElementById("planning");
    const headers = table.querySelectorAll("thead th");

    headers.forEach((th, index) => {

        if (index === 0) return;

        th.onclick = async () => {

            const newName = prompt("Nom employé :", th.textContent);
            if (!newName) return;

            planningData.employes[index - 1] = newName.toUpperCase();

            await sauvegarderFirestore();
        };

        th.oncontextmenu = async (e) => {

            e.preventDefault();

            planningData.employes.splice(index - 1, 1);

            await sauvegarderFirestore();
        };
    });
}


// ======================================================
// DRAG & DROP (simple)
// ======================================================
function activerDragAndDropColonnes() {
    const table = document.getElementById("planning");
    const headers = table.querySelectorAll("thead th");

    let dragIndex = null;

    headers.forEach((th, index) => {

        if (index === 0) return;

        th.draggable = true;

        th.ondragstart = () => {
            dragIndex = index;
        };

        th.ondrop = async (e) => {
            e.preventDefault();

            if (dragIndex === null || dragIndex === index) return;

            const temp = planningData.employes[dragIndex - 1];
            planningData.employes[dragIndex - 1] = planningData.employes[index - 1];
            planningData.employes[index - 1] = temp;

            await sauvegarderFirestore();
        };
    });
}


// ======================================================
// SELECTEURS UI
// ======================================================
const anneeSelect = document.getElementById("anneeSelect");
const blocSelect = document.getElementById("moisSelect");

const anneeActuelle = new Date().getFullYear();

for (let i = -2; i <= 2; i++) {
    const y = anneeActuelle + i;
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    if (i === 0) opt.selected = true;
    anneeSelect.appendChild(opt);
}


// ======================================================
// EVENTS
// ======================================================
anneeSelect.addEventListener("change", () => {
    currentYear = parseInt(anneeSelect.value);
    listenPlanning(currentYear, currentBloc);
});

blocSelect.addEventListener("change", () => {
    currentBloc = parseInt(blocSelect.value);
    listenPlanning(currentYear, currentBloc);
});


// ======================================================
// INIT
// ======================================================
document.addEventListener("DOMContentLoaded", () => {
    listenPlanning(currentYear, currentBloc);
});
// ======================================================
// CHARGEMENT FIRESTORE (simple)
// ======================================================

export async function chargerPlanning() {
    const snapshot = await getDocs(collection(db, "planning"));

    snapshot.forEach(docSnap => {
        const data = docSnap.data();

        console.log("chargé :", data);

        // 👉 plus tard : injection dans cellules
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const anneeActuelle = new Date().getFullYear();
    genererPlanning(anneeActuelle, 1);
});