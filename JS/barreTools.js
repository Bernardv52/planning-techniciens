let brushCell = null;
let brushMode = false;
let selecting = false;
let selectedCells = new Set();
let copiedCellData = null;


// =============================
// COPIER
// =============================
document.getElementById("copyBtn").addEventListener("click", () => {

    if (!brushCell) {
        alert("Clique d'abord sur une cellule à copier.");
        return;
    }

    copiedCellData = {
        html: brushCell.innerHTML,
        bg: brushCell.style.backgroundColor,
        color: brushCell.style.color,
        weight: brushCell.style.fontWeight
    };

    console.log("Cellule copiée");
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
        alert("Sélectionne une ou plusieurs cellules pour coller.");
        return;
    }

    selectedCells.forEach(c => {

        // if (c.cellIndex === 0) return; // ignore colonne dates
        if (c.classList.contains("date-cell")) return;

        c.innerHTML = copiedCellData.html;
        c.style.backgroundColor = copiedCellData.bg;
        c.style.color = copiedCellData.color;
        c.style.fontWeight = copiedCellData.weight;

        c.style.outline = "";
    });

    selectedCells.clear();
    sauvegarderPlanning(); // ✅ sauvegarde après coller
});

// =============================
// OUTILS
// =============================
function getSelectedText() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    if (sel.toString().length === 0) return null;
    return sel;
}

function clearCellSelection() {
    selectedCells.forEach(c => c.style.outline = "");
    selectedCells.clear();
}

// =============================
// MULTI-SELECTION CELLULES
// =============================
document.querySelectorAll("#planning tbody td").forEach(td => {

    td.contentEditable = true;

    td.addEventListener("mousedown", e => {
        if (td.cellIndex === 0) return;

        if (!e.ctrlKey) {
            selecting = true;
            clearCellSelection();
        }

        selectedCells.add(td);
        td.style.outline = "2px dashed black";
    });

    td.addEventListener("mouseover", e => {
        if (selecting) {
            selectedCells.add(td);
            td.style.outline = "2px dashed black";
        }
    });

    td.addEventListener("mouseup", e => {

        selecting = false;

        // 🔥 Si pinceau actif → appliquer le modèle
        if (brushMode && brushCell && selectedCells.size > 0) {

            const bg = brushCell.style.backgroundColor;

        selectedCells.forEach(c => {

            if (c.cellIndex === 0) return;

            // 🖌 On ne copie QUE la couleur de fond
            c.style.backgroundColor = bg;
            c.style.outline = "";
        });

        selectedCells.clear();
        brushMode = false;
        document.body.style.cursor = "default";
        sauvegarderPlanning(); // ✅ sauvegarde après pinceau
    }
    });

    td.addEventListener("click", e => {
        if (!e.ctrlKey && td.cellIndex !== 0) {
            brushCell = td;

            document.querySelectorAll("#planning tbody td")
                .forEach(c => c.style.outline = "");

            td.style.outline = "2px solid blue";
        }
    });
});

document.addEventListener("mouseup", () => selecting = false);

// =============================
// COULEURS (TEXTE OU FOND)
// =============================
document.querySelectorAll(".color-btn").forEach(btn => {
    btn.addEventListener("click", function () {

        const color = this.dataset.color;
        const selection = getSelectedText();

        // 🔹 TEXTE SÉLECTIONNÉ → couleur texte
        if (selection) {
            document.execCommand("styleWithCSS", false, true);
            document.execCommand("foreColor", false, color);
            sauvegarderPlanning(); // ✅ sauvegarde après couleur texte
            return;
        }

        // 🔹 MULTI CELLULES → fond
        if (selectedCells.size > 0) {
            selectedCells.forEach(c => {
                c.style.backgroundColor = color;
                c.style.outline = "";
            });
            selectedCells.clear();
            sauvegarderPlanning();
            return;
        }

        // 🔹 PINCEAU CELLULE ACTIVE → fond
        if (brushCell && brushCell.cellIndex !== 0) {
            brushCell.style.backgroundColor = color;
            sauvegarderPlanning();
        }
    });
});

// =============================
// GRAS
// =============================
document.getElementById("boldBtn").addEventListener("click", () => {

    const selection = getSelectedText();

    // 🔹 TEXTE SÉLECTIONNÉ
    if (selection) {
        document.execCommand("bold");
        sauvegarderPlanning(); // ✅ sauvegarde après coller
        return;
    }

    // 🔹 MULTI CELLULES
    if (selectedCells.size > 0) {
        selectedCells.forEach(c => {
            const current = window.getComputedStyle(c).fontWeight;
            c.style.fontWeight =
                (current === "700" || current === "bold")
                ? "normal"
                : "bold";

            c.style.outline = "";
        });
        selectedCells.clear();
        sauvegarderPlanning();
        return;
    }

    // 🔹 PINCEAU CELLULE
    if (brushCell && brushCell.cellIndex !== 0) {
        const current = window.getComputedStyle(brushCell).fontWeight;
        brushCell.style.fontWeight =
            (current === "700" || current === "bold")
            ? "normal"
            : "bold";
            sauvegarderPlanning(); // ✅ sauvegarde après pinceau
    }
});

// =============================
// PINCEAU (copie style cellule)
// =============================
document.getElementById("brushBtn").addEventListener("click", () => {

    if (!brushCell) {
        alert("Clique d'abord sur une cellule modèle.");
        return;
    }

    brushMode = true;

    document.body.style.cursor = "copy"; // curseur visuel
});
