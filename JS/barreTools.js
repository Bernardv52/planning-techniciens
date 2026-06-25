import { updateCell } from "./planning-core.js";
import { undoStack, redoStack } from "./planning-render.js";
let brushCell = null;
let brushMode = false;
let selecting = false;
let selectedCells = new Set();
let copiedCellData = null;
export function afficherMessageIndex(texte, type ) {

    const msg = document.getElementById("messageIndex");

    msg.textContent = texte;
    msg.className = type;
    msg.style.display = "block";

    setTimeout(() => {
        msg.style.display = "none";
    }, 4000);
}
function clearSelection() {
    selectedCells.forEach(c => c.style.outline = "");
    selectedCells.clear();
}
function getState(el) {
    const cs = window.getComputedStyle(el);

    return {
        html: el.innerHTML,
        bg: cs.backgroundColor,
        color: cs.color,
        weight: cs.fontWeight
    };
}

function saveCell(td) {
    if (!window.IS_ADMIN) return;

    /* console.log(
        "SAVE",
        td.dataset.date,
        td.dataset.empId
    ); */

    updateCell(
        td.dataset.date,
        parseInt(td.dataset.ligne),
        td.dataset.empId,   // 🔥 correction ici
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
    //ajout
     if (e.button === 2) return; // 🔥 ignore clic droit
     //fin ajout
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
    //ajout
    if (e.buttons === 2) return; // 🔥 ignore clic droit
    //fin ajout

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
             const before = getState(c);

                c.style.backgroundColor = bg;
                c.style.color = color;
                c.style.fontWeight = weight;

                const after = getState(c);

                undoStack.push({
                    dateISO: c.dataset.date,
                    ligne: Number(c.dataset.ligne),
                    empId: c.dataset.empId,
                    before,
                    after
                });

                //console.log("PINCEAU SAVE", undoStack[undoStack.length - 1]);

                redoStack.length = 0;

                saveCell(c);
                c.style.outline = "";
        });

        clearSelection();

        brushMode = false;
        document.body.style.cursor = "default";
    }
});

// 🔹 CLICK (cellule active)
tbody.addEventListener("click", e => {
     if (!window.IS_ADMIN) return;
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
    if (!window.IS_ADMIN) return;
    if (!brushCell) {
        afficherMessageIndex("Cliquer d'abord sur une cellule !","error");
        return;
    }

    copiedCellData = {
        html: brushCell.innerHTML,
        bg: window.getComputedStyle(brushCell).backgroundColor,
        color: brushCell.style.color,
        weight: brushCell.style.fontWeight
    };

    //console.log("📋 Copié");
});

// =============================
// COLLER (MULTI OK 🔥)
// =============================
document.getElementById("pasteBtn").addEventListener("click", () => {
    if (!window.IS_ADMIN) return;
    if (!copiedCellData) {
       afficherMessageIndex("Aucune cellule copiée !", "error");
        return;
    }

    if (selectedCells.size === 0) {
        afficherMessageIndex("Sélectionner une ou plusieurs cellules !","error");
        return;
    }

    selectedCells.forEach(c => {

        if (c.classList.contains("date-cell")) return;
             const before = {
                html: c.innerHTML,
                bg: window.getComputedStyle(c).backgroundColor,
                color: c.style.color,
                weight: c.style.fontWeight
            };

        c.innerHTML = copiedCellData.html;
        c.style.backgroundColor = copiedCellData.bg;
        c.style.color = copiedCellData.color;
        c.style.fontWeight = copiedCellData.weight;
        const after = {
            html: c.innerHTML,
            bg: window.getComputedStyle(c).backgroundColor,
            color: c.style.color,
            weight: c.style.fontWeight
        };

        undoStack.push({
            dateISO: c.dataset.date,
            ligne: Number(c.dataset.ligne),
            empId: c.dataset.empId,
            before,
            after
        });

        redoStack.length = 0;

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

        if (!window.IS_ADMIN) return;

        const color = btn.dataset.color;
        const selection = window.getSelection();

        // =============================
        // 🎨 TEXTE SELECTIONNÉ
        // =============================
        if (selection && selection.toString().length > 0) {

            document.execCommand("styleWithCSS", false, true);
            document.execCommand("foreColor", false, color);

            const td = selection.anchorNode?.closest?.("td");

            if (td) saveCell(td);

            return;
        }

        // =============================
        // 🎨 MULTI CELLULES
        // =============================
        if (selectedCells.size > 0) {

            selectedCells.forEach(c => {

                undoStack.push({

                    dateISO: c.dataset.date,
                    ligne: Number(c.dataset.ligne),
                    empId: c.dataset.empId,

                    before: {
                        html: c.innerHTML,
                        bg: c.style.backgroundColor,
                        color: c.style.color,
                        weight: c.style.fontWeight
                    },

                    after: {
                        html: c.innerHTML,
                        bg: color,
                        color: c.style.color,
                        weight: c.style.fontWeight
                    }

                });

                redoStack.length = 0;

                c.style.backgroundColor = color;

                saveCell(c);

                c.style.outline = "";

            });

            clearSelection();

            return;
        }

        // =============================
        // 🎨 CELLULE ACTIVE
        // =============================
        if (brushCell) {

            undoStack.push({

                dateISO: brushCell.dataset.date,
                ligne: Number(brushCell.dataset.ligne),
                empId: brushCell.dataset.empId,

                before: {
                    html: brushCell.innerHTML,
                    bg: brushCell.style.backgroundColor,
                    color: brushCell.style.color,
                    weight: brushCell.style.fontWeight
                },

                after: {
                    html: brushCell.innerHTML,
                    bg: color,
                    color: brushCell.style.color,
                    weight: brushCell.style.fontWeight
                }

            });

            redoStack.length = 0;

            brushCell.style.backgroundColor = color;

            saveCell(brushCell);
        }
    });
});

// =============================
// GRAS
// =============================
document.getElementById("boldBtn").addEventListener("click", () => {
    if (!window.IS_ADMIN) return;
    if (selectedCells.size > 0) {
        // 1. On vérifie si TOUTES les cellules sélectionnées sont vides
        const toutesVides = Array.from(selectedCells).every(c => c.textContent.trim() === "");
        if (toutesVides) {
            if (selectedCells.size > 1){
                afficherMessageIndex("Les cellules selectionnées sont vides !", "error");
            }
            else{
                afficherMessageIndex("La cellule selectionnée est vide !", "error");
            }
            
            return;
        }
        // 2. Si au moins une cellule a du texte, on applique le gras uniquement sur celles qui ne sont pas vides
        selectedCells.forEach(c => {
            // .trim() supprime les espaces vides pour être sûr que la cellule n'est pas "faussement" remplie
            if (c.textContent.trim() === "") return// On ignore les cellules vides du groupe en silence 
            const w = window.getComputedStyle(c).fontWeight;
            const before = {
                html: c.innerHTML,
                bg: window.getComputedStyle(c).backgroundColor,
                color: c.style.color,
                weight: c.style.fontWeight
            };

            c.style.fontWeight =
                (w === "700" || w === "bold") ? "normal" : "bold";
            const after = {
                html: c.innerHTML,
                bg: window.getComputedStyle(c).backgroundColor,
                color: c.style.color,
                weight: c.style.fontWeight
            };
            undoStack.push({
                dateISO: c.dataset.date,
                ligne: Number(c.dataset.ligne),
                empId: c.dataset.empId,
                before,
                after
            });
            redoStack.length = 0;
            saveCell(c);
        });

        clearSelection();
        //return;
    }
    // CAS 2 : Cellule unique "selection" active
   /*  else if (brushCell) {
        // On vérifie si la cellule brushCell est vide
        if (brushCell.textContent.trim() === "") {
            afficherMessageIndex("La cellule est vide !", "error");
            return; // On arrête la fonction ici
        }
        const w = window.getComputedStyle(brushCell).fontWeight;

        brushCell.style.fontWeight =
            (w === "700" || w === "bold") ? "normal" : "bold";

        saveCell(brushCell);
    } */
    // Rien n'est sélectionné du tout (ni sélection, ni pinceau)
    else {
        afficherMessageIndex("Sélectionner les celules où le texte !", "error");
    }
    
    
});

// =============================
// PINCEAU
// =============================
document.getElementById("brushBtn").addEventListener("click", () => {
    if (!window.IS_ADMIN) return;
    if (!brushCell) {
        afficherMessageIndex("Cliquer d'abord sur une cellule modèle !","error");
        return;
    }

    brushMode = true;
    document.body.style.cursor = "copy";
});
// =============================
// CTRL + V (COLLER NATIF MULTI)
// =============================
document.addEventListener("paste", (e) => {

    if (!window.IS_ADMIN) return;

    const text = e.clipboardData.getData("text/plain");

    if (!text) return;

    if (selectedCells.size === 0) return;

    e.preventDefault();

    selectedCells.forEach(c => {

        if (c.classList.contains("date-cell")) return;

        // 🔥 TEXTE UNIQUEMENT (pas de style navigateur)
        c.innerHTML = text;

        saveCell(c);

        c.style.outline = "";
    });

    clearSelection();
});




