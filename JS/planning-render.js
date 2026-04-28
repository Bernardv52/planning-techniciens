import { planning } from "./planning-core.js";
import { updateCell } from "./planning-core.js";
import { getJoursFeries,formatDateKey } from "./planning-utils.js";

export function renderPlanning() {

    const table = document.getElementById("planning");
    const tbody = table.querySelector("tbody");
    const headerRow = table.querySelector("thead tr");
    if (!planning) return;

    tbody.innerHTML = "";
    headerRow.innerHTML = "<th>DATE</th>";

    const employes = planning.employes || [];

    employes.forEach(emp => {
        const th = document.createElement("th");
        th.textContent = emp;
        headerRow.appendChild(th);
    });

    const annee = parseInt(document.getElementById("anneeSelect")?.value)
        || new Date().getFullYear();

    const bloc = parseInt(document.getElementById("moisSelect")?.value) || 1;

    const feries = getJoursFeries(annee);

    let date = new Date(annee, 0, 1);
    const dateFin = new Date(annee, 11, 31);

    let alternance = false;

    while (date <= dateFin) {

        const mois = date.getMonth();

        // filtre bloc
        if (
            (bloc === 1 && mois > 3) ||
            (bloc === 2 && (mois < 4 || mois > 7)) ||
            (bloc === 3 && mois < 8)
        ) {
            date.setDate(date.getDate() + 1);
            continue;
        }

        const dateISO = formatDateKey(date);

        const day = date.getDay();

        let couleur;

        if (feries.includes(dateISO)) {
            couleur = "var(--ferie)";
        } else if (day === 0 || day === 6) {
            couleur = "var(--weekend)";
        } else {
            couleur = alternance ? "var(--jour1)" : "var(--jour2)";
            alternance = !alternance;
        }

        // =========================
        // LIGNE 1
        // =========================
        const tr1 = document.createElement("tr");

        const tdDate = document.createElement("td");
        tdDate.rowSpan = 2;
        tdDate.classList.add("date-cell");
        tdDate.textContent = formatDate(dateISO);
        tdDate.dataset.date = dateISO;
        tdDate.style.backgroundColor = couleur;

        tr1.appendChild(tdDate);

        employes.forEach((emp, colIndex) => {

        const td = document.createElement("td");
        td.contentEditable = true;
        td.style.backgroundColor = couleur;

        const data = planning.data?.[dateISO]?.[0]?.[emp];

        if (data) {
            td.innerHTML = data.html || "";
            td.style.color = data.color || "";
            td.style.fontWeight = data.weight || "";
        }

        td.addEventListener("blur", () => {
            updateCell(dateISO, 0, emp, {
                html: td.innerHTML,
                bg: td.style.backgroundColor,
                color: td.style.color,
                weight: td.style.fontWeight
            });
        });

        tr1.appendChild(td);
        });

        tbody.appendChild(tr1);

        // =========================
        // LIGNE 2
        // =========================
        const tr2 = document.createElement("tr");

        employes.forEach((emp, colIndex) => {

            const td = document.createElement("td");
            td.contentEditable = true;
            td.style.backgroundColor = couleur;

            const data = planning.data?.[dateISO]?.[1]?.[emp];

            if (data) {
                td.innerHTML = data.html || "";
                td.style.color = data.color || "";
                td.style.fontWeight = data.weight || "";
            }

            td.addEventListener("blur", () => {
                updateCell(dateISO, 1, emp, {
                    html: td.innerHTML,
                    bg: td.style.backgroundColor,
                    color: td.style.color,
                    weight: td.style.fontWeight
                });
            });

            tr2.appendChild(td);
        });

        tbody.appendChild(tr2);

        date.setDate(date.getDate() + 1);
    }
}
export function renderPresence() {

    const cells = document.querySelectorAll("#planning td");

    // reset UI
    cells.forEach(td => {
        td.style.outline = "";
        td.title = "";
    });

    const presence = planning.presence || {};

    Object.values(presence).forEach(user => {

        if (!user.editing) return;

        const cell = document.querySelector(`[data-id="${user.editing}"]`);

        if (!cell) return;

        cell.style.outline = `2px solid ${user.color || "blue"}`;
        cell.title = user.name || "Utilisateur";
    });
}

// =========================
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}