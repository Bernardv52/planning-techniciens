import { planning } from "./planning-core.js";
import { setEditing, clearEditing } from "./presence.js";
import { updateCell } from "./planning-core.js";


/**
 * 🔵 RENDU PRINCIPAL DU PLANNING
 * ➜ Construit le tableau HTML uniquement
 */
export function renderPlanning() {

    const table = document.getElementById("planning");
    const tbody = table.querySelector("tbody");
    const headerRow = table.querySelector("thead tr");

    // 🔹 Reset
    tbody.innerHTML = "";
    headerRow.innerHTML = "<th>DATE</th>";

    // 🔹 Headers employés
    (planning.employes || []).forEach(emp => {
        const th = document.createElement("th");
        th.textContent = emp;
        headerRow.appendChild(th);
    });

    // 🔹 Dates triées (important pour cohérence)
    const dates = Object.keys(planning.data || {}).sort();

    dates.forEach(date => {

        const tr = document.createElement("tr");

        // 📅 Colonne date
        const tdDate = document.createElement("td");
        tdDate.textContent = formatDate(date);
        tdDate.classList.add("date-cell");
        tr.appendChild(tdDate);

        // 📦 Cellules employés
        (planning.employes || []).forEach((_, colIndex) => {

            const td = document.createElement("td");
            td.contentEditable = true;

            const cellId = `${date}_${colIndex}`;
            td.dataset.id = cellId;

            const value = planning.data?.[date]?.cells?.[colIndex] || "";
            td.innerText = value;

            // 🟡 Focus → présence utilisateur
            td.addEventListener("focus", () => {
                setEditing(cellId);
            });

            // 💾 Blur → sauvegarde Firestore
            td.addEventListener("blur", () => {
                updateCell(date, colIndex, td.innerText);
                clearEditing();
            });

            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

/**
 * 🟣 OVERLAY PRESENCE (multi-utilisateurs)
 * ➜ surlignage des cellules en cours d'édition
 */
export function renderPresence() {

    // 🔹 Reset visuel (important)
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

/**
 * 🧩 FORMAT DATE (optionnel mais propre)
 */
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