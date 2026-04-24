import { getJoursFeries,getDateRange } from "./planning-utils.js";
import { planning } from "./planning-core.js";
import { setEditing, clearEditing } from "./presence.js";
import { updateCell } from "./planning-core.js";


// ======================================================
// 🔵 RENDU PRINCIPAL DU PLANNING
// ======================================================
export function renderPlanning() {

    const table = document.getElementById("planning");
    const tbody = table.querySelector("tbody");
    const headerRow = table.querySelector("thead tr");

    // 🔥 reset
    tbody.innerHTML = "";
    headerRow.innerHTML = "<th>DATE</th>";

    // 👥 employés
    const employes = planning.employes || [];

    employes.forEach(emp => {
        const th = document.createElement("th");
        th.textContent = emp;
        headerRow.appendChild(th);
    });

    // 📅 paramètres dynamiques
    const annee = parseInt(document.getElementById("anneeSelect").value);
    const bloc = parseInt(document.getElementById("moisSelect").value);

    const { start, end } = getDateRange(bloc, annee);
    const feries = getJoursFeries(annee);

    // ======================================================
    // 🔥 génération des lignes
    // ======================================================
    let date = new Date(start);

    while (date <= end) {

        const dateISO = date.toISOString().split("T")[0];

        const tr = document.createElement("tr");

        // =========================
        // 📅 COLONNE DATE
        // =========================
        const tdDate = document.createElement("td");
        tdDate.textContent = formatDate(dateISO);
        tdDate.classList.add("date-cell");

        // week-end
        const day = date.getDay();
        if (day === 0 || day === 6) {
            tdDate.style.backgroundColor = "#91A1A0";
        }

        // jours fériés
        if (feries.includes(dateISO)) {
            tdDate.style.backgroundColor = "#A49A8E";
        }

        tr.appendChild(tdDate);

        // =========================
        // 👥 COLONNES EMPLOYÉS
        // =========================
        employes.forEach((_, colIndex) => {

            const td = document.createElement("td");
            td.contentEditable = true;

            const cellId = `${dateISO}_${colIndex}`;
            td.dataset.id = cellId;

            const value =
                planning.data?.[dateISO]?.cells?.[colIndex] || "";

            td.innerText = value;

            // 🔵 focus → présence
            td.addEventListener("focus", () => {
                setEditing(cellId);
            });

            // 💾 blur → save Firestore
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