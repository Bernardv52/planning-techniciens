import { updateCell } from "./planning-core.js";
let brushCell = null;
let brushMode = false;
let selecting = false;
let selectedCells = new Set();
let copiedCellData = null;
function clearSelection() {
    selectedCells.forEach(c => c.style.outline = "");
    selectedCells.clear();
}

function saveCell(td) {

    updateCell(
        td.dataset.date,
        parseInt(td.dataset.ligne),
        td.dataset.emp,
        {
            html: td.innerHTML,
            bg: window.getComputedStyle(td).backgroundColor,
            color: td.style.color,
            weight: td.style.fontWeight
        }
    );
}

// =============================
// EVENT DELEGATION (SOLIDE)
// =============================
const tbody = document.querySelector("#planning tbody");

// 🔹 MOUSEDOWN
tbody.addEventListener("mousedown", e => {

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    if (!e.ctrlKey) {
        selecting = true;
        clearSelection();
    }

    selectedCells.add(td);
    td.style.outline = "2px dashed black";
});

// 🔹 MOUSEOVER
tbody.addEventListener("mouseover", e => {

    if (!selecting) return;

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    selectedCells.add(td);
    td.style.outline = "2px dashed black";
});

// 🔹 MOUSEUP (Pinceau ici 🔥)
tbody.addEventListener("mouseup", () => {

    selecting = false;

    if (brushMode && brushCell && selectedCells.size > 0) {

        const bg = window.getComputedStyle(brushCell).backgroundColor;
        const color = brushCell.style.color;
        const weight = brushCell.style.fontWeight;

        selectedCells.forEach(c => {

            c.style.backgroundColor = bg;
            c.style.color = color;
            c.style.fontWeight = weight;

            saveCell(c); // 🔥 sauvegarde immédiate
            c.style.outline = "";
        });

        clearSelection();

        brushMode = false;
        document.body.style.cursor = "default";
    }
});

// 🔹 CLICK (cellule active)
tbody.addEventListener("click", e => {

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    brushCell = td;

    document.querySelectorAll("#planning tbody td")
        .forEach(c => c.style.outline = "");

    td.style.outline = "2px solid blue";
});

document.addEventListener("mouseup", () => selecting = false);

// =============================
// COPIER
// =============================
document.getElementById("copyBtn").addEventListener("click", () => {

    if (!brushCell) {
        alert("Clique d'abord sur une cellule.");
        return;
    }

    copiedCellData = {
        html: brushCell.innerHTML,
        bg: window.getComputedStyle(brushCell).backgroundColor,
        color: brushCell.style.color,
        weight: brushCell.style.fontWeight
    };

    console.log("📋 Copié");
});

// =============================
// COLLER (MULTI OK 🔥)
// =============================
document.getElementById("pasteBtn").addEventListener("click", () => {

    if (!copiedCellData) {
        alert("Aucune cellule copiée.");
        return;
    }

    if (selectedCells.size === 0) {
        alert("Sélectionne une ou plusieurs cellules.");
        return;
    }

    selectedCells.forEach(c => {

        if (c.classList.contains("date-cell")) return;

        c.innerHTML = copiedCellData.html;
        c.style.backgroundColor = copiedCellData.bg;
        c.style.color = copiedCellData.color;
        c.style.fontWeight = copiedCellData.weight;

        saveCell(c); // 🔥 sauvegarde

        c.style.outline = "";
    });

    clearSelection();
});

// =============================
// COULEURS (MULTI + SAVE 🔥)
// =============================
document.querySelectorAll(".color-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        const color = btn.dataset.color;
        const selection = window.getSelection();
          // =============================
        // 🎨 TEXTE SELECTIONNÉ
        // =============================
        if (selection && selection.toString().length > 0) {

            document.execCommand("styleWithCSS", false, true);
            document.execCommand("foreColor", false, color);

            // 🔥 sauvegarde cellule active
            const td = selection.anchorNode?.closest?.("td");
            if (td) saveCell(td);

            return;
        }
         // =============================
        // 🎨 MULTI CELLULES (fond)
        // =============================
        if (selectedCells.size > 0) {

            selectedCells.forEach(c => {

                c.style.backgroundColor = color;

                saveCell(c); // 🔥 CRUCIAL
                c.style.outline = "";
            });

            clearSelection();
            return;
        }
        // =============================
        // 🎨 CELLULE ACTIVE (fond)
        // =============================
        if (brushCell) {
            brushCell.style.backgroundColor = color;
            saveCell(brushCell);
        }
    });
});

// =============================
// GRAS
// =============================
document.getElementById("boldBtn").addEventListener("click", () => {

    if (selectedCells.size > 0) {

        selectedCells.forEach(c => {

            const w = window.getComputedStyle(c).fontWeight;

            c.style.fontWeight =
                (w === "700" || w === "bold") ? "normal" : "bold";

            saveCell(c);
        });

        clearSelection();
        return;
    }

    if (brushCell) {

        const w = window.getComputedStyle(brushCell).fontWeight;

        brushCell.style.fontWeight =
            (w === "700" || w === "bold") ? "normal" : "bold";

        saveCell(brushCell);
    }
});

// =============================
// PINCEAU
// =============================
document.getElementById("brushBtn").addEventListener("click", () => {

    if (!brushCell) {
        alert("Clique d'abord sur une cellule modèle.");
        return;
    }

    brushMode = true;
    document.body.style.cursor = "copy";
});

