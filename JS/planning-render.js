import { getJoursFeries,getDateRange } from "./planning-utils.js";
import { planning } from "./planning-core.js";
import { setEditing, clearEditing } from "./presence.js";
import { updateCell } from "./planning-core.js";


// ======================================================
// 🔵 RENDU PRINCIPAL DU PLANNING
// ======================================================
export function renderPlanning() {
    // 📅 paramètres dynamiques
    const annee = parseInt(document.getElementById("anneeSelect").value);
    const bloc = parseInt(document.getElementById("moisSelect").value);
    console.log("ANNEE =", annee);
    console.log("BLOC =", bloc);
    const feries = getJoursFeries(annee);

let date = new Date(annee, 0, 1);
const dateFin = new Date(annee, 11, 31);

while (date <= dateFin) {

    const mois = date.getMonth();

    // 🔥 FILTRE PAR BLOC (comme ton ancien code)
    if (
        (bloc === 1 && mois > 3) ||
        (bloc === 2 && (mois < 4 || mois > 7)) ||
        (bloc === 3 && mois < 8)
    ) {
        date.setDate(date.getDate() + 1);
        continue;
    }

    const dateISO = date.toISOString().split("T")[0];

    const tr = document.createElement("tr");

    // DATE
    const tdDate = document.createElement("td");
    tdDate.textContent = formatDate(dateISO);
    tdDate.classList.add("date-cell");

    const day = date.getDay();

        // jours fériés
       if (feries.includes(dateISO)) {
        tdDate.style.backgroundColor = "#ffe5e5";
    } else if (day === 0 || day === 6) {
        tdDate.style.backgroundColor = "#f3f3f3";
    }

    tr.appendChild(tdDate);

    // EMPLOYÉS
    (planning.employes || []).forEach((_, colIndex) => {

        const td = document.createElement("td");
        td.contentEditable = true;

        const cellId = `${dateISO}_${colIndex}`;
        td.dataset.id = cellId;

        const value =
            planning.data?.[dateISO]?.cells?.[colIndex] || "";

        td.innerText = value;

        td.addEventListener("focus", () => {
            setEditing(cellId);
        });

        td.addEventListener("blur", () => {
            updateCell(dateISO, colIndex, td.innerText);
            clearEditing();
        });

        tr.appendChild(td);
    });

    tbody.appendChild(tr);

    date.setDate(date.getDate() + 1);
}
}


// ======================================================
// 🟣 PRESENCE MULTI-UTILISATEURS
// ======================================================
export function renderPresence() {

    document.querySelectorAll("#planning td").forEach(td => {
        td.style.outline = "";
        td.title = "";
    });

    const presence = planning.presence || {};

    Object.values(presence).forEach(user => {

        if (!user.editing) return;

        const cell = document.querySelector(
            `[data-id="${user.editing}"]`
        );

        if (cell) {
            cell.style.outline = `2px solid ${user.color || "blue"}`;
            cell.title = user.name || "Utilisateur";
        }
    });
}


// ======================================================
// 🧩 FORMAT DATE
// ======================================================
function formatDate(dateStr) {
    try {
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    } catch {
        return dateStr;
    }
}