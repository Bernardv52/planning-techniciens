let brushCell = null;
let brushMode = false;
let selecting = false;
let selectedCells = new Set();
let copiedCellData = null;

// =============================
// UTILS
// =============================
function clearSelection() {
    selectedCells.forEach(c => c.style.outline = "");
    selectedCells.clear();
}

// =============================
// SELECT DOM ROOT (IMPORTANT)
// =============================
const tbody = document.querySelector("#planning tbody");

// =============================
// SELECTION
// =============================
tbody.addEventListener("mousedown", (e) => {

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    if (!e.ctrlKey) {
        selecting = true;
        clearSelection();
    }

    selectedCells.add(td);
    td.style.outline = "2px dashed black";
});

tbody.addEventListener("mouseover", (e) => {

    if (!selecting) return;

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    selectedCells.add(td);
    td.style.outline = "2px dashed black";
});

document.addEventListener("mouseup", () => {
    selecting = false;
});

// =============================
// CLICK CELL (ACTIVE + PINCEAU SOURCE)
// =============================
tbody.addEventListener("click", (e) => {

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    brushCell = td;

    document.querySelectorAll("#planning td")
        .forEach(c => c.style.outline = "");

    td.style.outline = "2px solid blue";
});

// =============================
// COPY
// =============================
document.getElementById("copyBtn").addEventListener("click", () => {

    if (!brushCell) return alert("Sélectionne une cellule");

    copiedCellData = {
        html: brushCell.innerHTML,
        bg: brushCell.style.backgroundColor,
        color: brushCell.style.color,
        weight: brushCell.style.fontWeight
    };
});

// =============================
// PASTE (MULTI OK)
// =============================
document.getElementById("pasteBtn").addEventListener("click", () => {

    if (!copiedCellData) return alert("Rien copié");

    if (selectedCells.size === 0) {
        return alert("Sélectionne des cellules");
    }

    selectedCells.forEach(c => {

        if (c.classList.contains("date-cell")) return;

        c.innerHTML = copiedCellData.html;
        c.style.backgroundColor = copiedCellData.bg;
        c.style.color = copiedCellData.color;
        c.style.fontWeight = copiedCellData.weight;
    });

    clearSelection();
});

// =============================
// COULEURS
// =============================
document.querySelectorAll(".color-btn").forEach(btn => {

    btn.addEventListener("click", () => {

        const color = btn.dataset.color;

        // multi selection
        if (selectedCells.size > 0) {

            selectedCells.forEach(c => {
                c.style.backgroundColor = color;
            });

            clearSelection();
            return;
        }

        // cellule active
        if (brushCell) {
            brushCell.style.backgroundColor = color;
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
                (w === "bold" || w === "700")
                    ? "normal"
                    : "bold";
        });

        clearSelection();
        return;
    }

    if (brushCell) {

        const w = window.getComputedStyle(brushCell).fontWeight;

        brushCell.style.fontWeight =
            (w === "bold" || w === "700")
                ? "normal"
                : "bold";
    }
});

// =============================
// PINCEAU
// =============================
document.getElementById("brushBtn").addEventListener("click", () => {

    if (!brushCell) return alert("Choisis une cellule source");

    brushMode = true;
    document.body.style.cursor = "copy";
});

// =============================
// APPLICATION PINCEAU
// =============================
tbody.addEventListener("mouseup", () => {

    if (!brushMode || !brushCell) return;

    if (selectedCells.size === 0) return;

    const bg = brushCell.style.backgroundColor;
    const color = brushCell.style.color;
    const weight = brushCell.style.fontWeight;

    selectedCells.forEach(c => {

        if (c.classList.contains("date-cell")) return;

        c.style.backgroundColor = bg;
        c.style.color = color;
        c.style.fontWeight = weight;
    });

    clearSelection();

    brushMode = false;
    document.body.style.cursor = "default";
});


/* let activeCell = null;
let copiedCellData = null;

let selecting = false;
let selectedCells = new Set(); // 🔥 contient des KEYS

let brushMode = false;
let brushCellKey = null;

// =============================
// UTILS
// =============================
function makeKey(td) {
    return `${td.dataset.date}|${td.dataset.emp}|${td.dataset.ligne}`;
}

function getCellByKey(key) {
    const [date, emp, ligne] = key.split("|");

    return document.querySelector(
        `td[data-date="${date}"][data-emp="${emp}"][data-ligne="${ligne}"]`
    );
}

function clearSelectionUI() {
    document.querySelectorAll("#planning td")
        .forEach(c => c.style.outline = "");
}

// =============================
// SELECTION MULTI
// =============================
const table = document.getElementById("planning");

table.addEventListener("mousedown", (e) => {

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    selecting = true;

    if (!e.ctrlKey) {
        selectedCells.clear();
        clearSelectionUI();
    }

    const key = makeKey(td);
    selectedCells.add(key);

    td.style.outline = "2px dashed black";
});

table.addEventListener("mouseover", (e) => {

    if (!selecting) return;

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    const key = makeKey(td);
    selectedCells.add(key);

    td.style.outline = "2px dashed black";
});

// =============================
// MOUSE UP GLOBAL
// =============================
document.addEventListener("mouseup", async () => {

    selecting = false;

    if (brushMode && brushCellKey && selectedCells.size > 0) {

        const source = getCellByKey(brushCellKey);
        if (!source) return;

        const updates = [];

        selectedCells.forEach(key => {

            const c = getCellByKey(key);
            if (!c || c.classList.contains("date-cell")) return;

            // 🔹 DOM
            c.style.backgroundColor = source.style.backgroundColor;
            c.style.color = source.style.color;
            c.style.fontWeight = source.style.fontWeight;

            // 🔹 PREPARE
            updates.push({
                date: c.dataset.date,
                ligne: c.dataset.ligne,
                emp: c.dataset.emp,
                data: {
                    html: c.innerHTML,
                    bg: c.style.backgroundColor,
                    color: c.style.color,
                    weight: c.style.fontWeight
                }
            });
        });

        // 🔥 SAVE APRES
        for (const u of updates) {
            await updateCell(u.date, u.ligne, u.emp, u.data);
        }
    }

    brushMode = false;
    document.body.style.cursor = "default";
});

// =============================
// CELLULE ACTIVE
// =============================
table.addEventListener("click", (e) => {

    const td = e.target.closest("td");
    if (!td || td.classList.contains("date-cell")) return;

    activeCell = td;

    clearSelectionUI();
    td.style.outline = "2px solid blue";
});

// =============================
// COPIER
// =============================
document.getElementById("copyBtn").addEventListener("click", () => {

    if (!activeCell) {
        alert("Clique une cellule à copier.");
        return;
    }

    copiedCellData = {
        html: activeCell.innerHTML,
        bg: activeCell.style.backgroundColor,
        color: activeCell.style.color,
        weight: activeCell.style.fontWeight
    };

    console.log("📋 Copié");
});

// =============================
// COLLER
// =============================
document.getElementById("pasteBtn").addEventListener("click", () => {

    if (!copiedCellData) return;

    const targets = selectedCells.size > 0
        ? Array.from(selectedCells).map(getCellByKey)
        : (activeCell ? [activeCell] : []);

    const updates = [];

    targets.forEach(c => {

        if (!c || c.classList.contains("date-cell")) return;

        // 🔹 1. MAJ DOM
        c.innerHTML = copiedCellData.html;
        c.style.backgroundColor = copiedCellData.bg;
        c.style.color = copiedCellData.color;
        c.style.fontWeight = copiedCellData.weight;

        // 🔹 2. PREPARE UPDATE
        updates.push({
            date: c.dataset.date,
            ligne: c.dataset.ligne,
            emp: c.dataset.emp,
            data: {
                html: c.innerHTML,
                bg: c.style.backgroundColor,
                color: c.style.color,
                weight: c.style.fontWeight
            }
        });
    });

    // 🔥 3. SAVE APRES (CRUCIAL)
    for (const u of updates) {
        await updateCell(u.date, u.ligne, u.emp, u.data);
    }

    selectedCells.clear();
    clearSelectionUI();
});

// =============================
// PINCEAU
// =============================
document.getElementById("brushBtn").addEventListener("click", () => {

    if (!activeCell) {
        alert("Clique une cellule modèle.");
        return;
    }

    brushMode = true;
    brushCellKey = makeKey(activeCell);

    document.body.style.cursor = "copy";

    console.log("🖌 Pinceau activé");
});

// =============================
// COULEURS
// =============================
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        const color = btn.dataset.color;

        // MULTI
        if (selectedCells.size > 0) {

            selectedCells.forEach(key => {

                const c = getCellByKey(key);
                if (!c) return;

                c.style.backgroundColor = color;
                saveCell(c);
            });

            selectedCells.clear();
            clearSelectionUI();
            return;
        }

        // ACTIVE
        if (activeCell) {
            activeCell.style.backgroundColor = color;
            saveCell(activeCell);
        }
    });
});

// =============================
// GRAS
// =============================
document.getElementById("boldBtn").addEventListener("click", () => {

    // MULTI
    if (selectedCells.size > 0) {

        selectedCells.forEach(key => {

            const c = getCellByKey(key);
            if (!c) return;

            const w = window.getComputedStyle(c).fontWeight;

            c.style.fontWeight =
                (w === "700" || w === "bold")
                ? "normal"
                : "bold";

            saveCell(c);
        });

        selectedCells.clear();
        clearSelectionUI();
        return;
    }

    // ACTIVE
    if (activeCell) {

        const w = window.getComputedStyle(activeCell).fontWeight;

        activeCell.style.fontWeight =
            (w === "700" || w === "bold")
            ? "normal"
            : "bold";

        saveCell(activeCell);
    }
}); */



/* import { updateCell } from "./planning-core.js";

// =============================
// ÉTATS SIMPLES (SOURCE UNIQUE)
// =============================
let activeCell = null;
let brushCell = null;
let brushMode = false;
let selecting = false;
let selectedCells = new Set();


// =============================
// UTILS
// =============================
function resetToolState() {
    brushMode = false;
    selectedCells.clear();

    document.body.style.cursor = "default";

    document.querySelectorAll("#planning td")
        .forEach(c => c.style.outline = "");
}
function resetSelectionUI() {
    document.querySelectorAll("#planning tbody td").forEach(td => {
        td.style.outline = "";
    });
}

function clearCellSelection() {
    resetSelectionUI();
    selectedCells.clear();
}

// =============================
// SAUVEGARDE FIRESTORE
// =============================
function saveCell(cell) {
    updateCell(
        cell.dataset.date,
        parseInt(cell.dataset.ligne),
        cell.dataset.emp,
        {
            html: cell.innerHTML,
            bg: cell.style.backgroundColor,
            color: cell.style.color,
            weight: cell.style.fontWeight
        }
    );
}

// =============================
// TABLE BODY
// =============================
const tbody = document.querySelector("#planning tbody");

// =============================
// CLICK = cellule active
// =============================
tbody.addEventListener("click", e => {

    const td = e.target.closest("td");
    if (!td || td.cellIndex === 0) return;

    if (!e.ctrlKey) {
        clearCellSelection();
    }

    activeCell = td;
    resetToolState();
    brushCell = td;

    resetSelectionUI();
    td.style.outline = "2px solid blue";
});

// =============================
// SELECTION MULTI (mousedown)
// =============================
tbody.addEventListener("mousedown", e => {

    const td = e.target.closest("td");
    if (!td || td.cellIndex === 0) return;

    if (!e.ctrlKey) {
        selecting = true;
        clearCellSelection();
    }

    selectedCells.add(td);
    td.style.outline = "2px dashed black";
});

// =============================
// DRAG SELECTION
// =============================
tbody.addEventListener("mouseover", e => {

    if (!selecting) return;

    const td = e.target.closest("td");
    if (!td || td.cellIndex === 0) return;

    selectedCells.add(td);
    td.style.outline = "2px dashed black";
});

// =============================
// STOP SELECTION
// =============================
document.addEventListener("mouseup", () => {
    selecting = false;
    // =============================
    // PINCEAU
    // =============================
    if (brushMode && brushCell && selectedCells.size > 0) {

        const bg = brushCell.style.backgroundColor;
        const color = brushCell.style.color;
        const weight = brushCell.style.fontWeight;

        selectedCells.forEach(c => {

            if (c.cellIndex === 0) return;

            c.style.backgroundColor = bg;
            c.style.color = color;
            c.style.fontWeight = weight;

            c.style.outline = "";

            // 💾 sauvegarde cellule par cellule
            saveCell(c);
        });

        selectedCells.clear();
    }

    // 🔥 toujours reset état outil
    brushMode = false;
    document.body.style.cursor = "default";
});

// =============================
// COPIER
// =============================
let copiedCellData = null;

document.getElementById("copyBtn").addEventListener("click", () => {

    if (!brushCell) {
        alert("Clique d'abord sur une cellule.");
        return;
    }
    resetToolState();
    copiedCellData = {
        html: brushCell.innerHTML,
        bg: brushCell.style.backgroundColor,
        color: brushCell.style.color,
        weight: brushCell.style.fontWeight
    };
});

// =============================
// COLLER
// =============================
document.getElementById("pasteBtn").addEventListener("click", () => {

    if (!copiedCellData) {
        alert("Aucune cellule copiée.");
        return;
    }

    if (selectedCells.size === 0) {
        alert("Sélectionne des cellules.");
        return;
    }

    selectedCells.forEach(c => {

        if (c.classList.contains("date-cell")) return;

        c.innerHTML = copiedCellData.html;
        c.style.backgroundColor = copiedCellData.bg;
        c.style.color = copiedCellData.color;
        c.style.fontWeight = copiedCellData.weight;

        saveCell(c);
        resetToolState();
    });

    clearCellSelection();
});

// =============================
// COULEURS
// =============================
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        const color = btn.dataset.color;

        // 🔹 MULTI CELLULES
        if (selectedCells.size > 0) {

            selectedCells.forEach(c => {
                c.style.backgroundColor = color;
                saveCell(c);
            });

            clearCellSelection();
            return;
        }

        // 🔹 CELLULE ACTIVE
        if (activeCell) {
            activeCell.style.backgroundColor = color;
            saveCell(activeCell);
        }
    });
});

// =============================
// GRAS
// =============================
document.getElementById("boldBtn").addEventListener("click", () => {

    // 🔹 MULTI CELLULES
    if (selectedCells.size > 0) {

        selectedCells.forEach(c => {
            const w = window.getComputedStyle(c).fontWeight;

            c.style.fontWeight =
                (w === "700" || w === "bold")
                ? "normal"
                : "bold";

            saveCell(c);
        });

        clearCellSelection();
        return;
    }

    // 🔹 CELLULE ACTIVE
    if (activeCell) {

        const w = window.getComputedStyle(activeCell).fontWeight;

        activeCell.style.fontWeight =
            (w === "700" || w === "bold")
            ? "normal"
            : "bold";

        saveCell(activeCell);
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
    resetToolState();
    brushMode = true;
    document.body.style.cursor = "copy";
}); */