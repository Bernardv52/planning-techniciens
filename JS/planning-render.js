import { planning, updateCell } from "./planning-core.js";
import { getJoursFeries, formatDateKey } from "./planning-utils.js";
import { activerDragAndDropColonnes, rendreHeadersInteractifs, refreshEmployeSelect, initUI } from "./planning-ui.js";
import { autoResizeHeaders } from "./planning-edit.js";
//ajout back
export let undoStack = [];
export let redoStack = [];
// fin ajout
// =========================
// STATE UI SAFE (important)
// =========================
let renderLock = false;

// =========================
// MAIN RENDER
// =========================
export function renderPlanning() {
    if (!planning.blocs) return;
   /*  console.log("PLANNING REÇU:", planning);
    console.log("EMPLOYES:", planning.employes);
    console.log("BLOCS:", planning.blocs); */
    if (renderLock) return;
    renderLock = true;

    const table = document.getElementById("planning");
    const tbody = table.querySelector("tbody");
    const headerRow = table.querySelector("thead tr");

    if (!planning || !planning.employes) {
        renderLock = false;
        return;
    }

    const employes = planning.employes;

    // =========================
    // RESET DOM
    // =========================
    tbody.innerHTML = "";
    headerRow.innerHTML = "<th>DATE</th>";

    // =========================
    // HEADERS
    // =========================
    employes.forEach(emp => {
        const th = document.createElement("th");

        th.textContent =  emp.name || "[SANS NOM]";

        // ID STABLE
        th.dataset.empId = emp.id;

        // nom affiché
        th.dataset.empName = emp.name ||"";

        headerRow.appendChild(th);
    });

    const annee =
        parseInt(document.getElementById("anneeSelect")?.value)
        || new Date().getFullYear();

    const bloc =
        parseInt(document.getElementById("moisSelect")?.value)
        || 1;

    const blocData =
        planning.blocs?.[`bloc${bloc}`]?.data || {};

    const feries = getJoursFeries(annee).map(d => formatDateKey(new Date(d)));
    const exclusions = (planning.joursFeriesExclus || []).map(d => String(d));;
    let date = new Date(annee, 0, 1);
    const dateFin = new Date(annee, 11, 31);
    
    let alternance = false;
    //code ajouté
    //console.log("BLOC SELECTED:", bloc);
    //console.log("START DATE LOOP");
    //fin code ajouté
    // =========================
    // LOOP DATES
    // =========================
    while (date <= dateFin) {

        const mois = date.getMonth();

        if (
            (bloc === 1 && mois > 3) ||
            (bloc === 2 && (mois < 4 || mois > 7)) ||
            (bloc === 3 && mois < 8)
        ) {
            date.setDate(date.getDate() + 1);
            continue;
        }

        const dateISO = formatDateKey(date);
        const estFerie = feries.includes(dateISO) && !exclusions.includes(dateISO);
        const day = date.getDay();
       /*  console.log("FERIE EXEMPLE:", feries[0]);
        console.log("DATE ISO EXEMPLE:", dateISO);   */

        let couleur;
        /* if (feries.includes(dateISO)) {
            console.log("FERIE MATCH :", dateISO);
        } */
        if (estFerie) {
            couleur = "var(--ferie)";
        } else if (day === 0 || day === 6) {
            couleur = "var(--weekend)";
        } else {
            couleur = alternance ? "var(--jour1)" : "var(--jour2)";
            alternance = !alternance;
        }

        // =========================
        // ROW 1
        // =========================
        const tr1 = document.createElement("tr");

        const tdDate = document.createElement("td");
        tdDate.rowSpan = 2;
        tdDate.classList.add("date-cell");
        tdDate.dataset.date = dateISO;
        tdDate.textContent = formatDate(dateISO);
        tdDate.style.backgroundColor = couleur;

        tr1.appendChild(tdDate);

        employes.forEach(emp => {

            const td = document.createElement("td");
            td.contentEditable = window.IS_ADMIN;

            td.dataset.date = dateISO;
            td.dataset.empId = emp.id;
            td.dataset.empName = emp.name;
            td.dataset.ligne = 0;

            td.style.backgroundColor = couleur;

            const data = blocData?.[dateISO]?.[0]?.[emp.id];
            
            if (data) {
                 td.innerHTML =(data.html === "<br>" || data.html === "<div><br></div>")? "": (data.html || "");
                /*td.innerHTML = data.html || "";*/
                td.style.backgroundColor = data.bg || couleur;
                td.style.color = data.color || "";
                td.style.fontWeight = data.weight || "";
            }
             // =========================
            // SAVE ANCIEN ETAT (focus)
            // =========================
            td.addEventListener("focus", () => {

                td.dataset.oldHtml = td.innerHTML;
                td.dataset.oldBg = window.getComputedStyle(td).backgroundColor;
                td.dataset.oldColor = td.style.color;
                td.dataset.oldWeight = td.style.fontWeight;

            });

            td.addEventListener("blur", () => {
                         if (td.textContent.trim() === "") {
                            td.innerHTML = "";
                        }
                        const oldHtml = td.dataset.oldHtml || "";
                        const oldBg = td.dataset.oldBg || "";
                        const oldColor = td.dataset.oldColor || "";
                        const oldWeight = td.dataset.oldWeight || "";

                        const changed =
                            oldHtml !== td.innerHTML ||
                            oldBg !== td.style.backgroundColor ||
                            oldColor !== td.style.color ||
                            oldWeight !== td.style.fontWeight;

                        if (!changed) return;
                       /*  console.log("AVANT COULEUR =", td.dataset.oldBg);
                        console.log("APRES COULEUR =", td.style.backgroundColor); */
                        undoStack.push({

                             dateISO,
                    ligne:0, // ou 0 selon ROW

                    empId:emp.id,

                    before:{
                        html: oldHtml,
                        bg: window.getComputedStyle(td).backgroundColor,
                        color: oldColor,
                        weight: oldWeight
                    },

                    after:{
                        html: td.innerHTML,
                        bg: window.getComputedStyle(td).backgroundColor,
                        color: td.style.color,
                        weight: td.style.fontWeight
                                            }

                        });
                redoStack = [];
                // fin ajout
               /*  console.log("SAVE FIREBASE", {
                    html: td.innerHTML,
                    bg: window.getComputedStyle(td).backgroundColor,
                    color: td.style.color,
                    weight: td.style.fontWeight
                }); */
              
                updateCell(dateISO, 0, emp.id, {
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
        // ROW 2
        // =========================
        const tr2 = document.createElement("tr");

        employes.forEach(emp => {

            const td = document.createElement("td");
            td.contentEditable = window.IS_ADMIN;

            td.dataset.date = dateISO;
            td.dataset.empId = emp.id;
            td.dataset.empName = emp.name;
            td.dataset.ligne = 1;

            td.style.backgroundColor = couleur;

            const data = blocData?.[dateISO]?.[1]?.[emp.id];

            if (data) {
                td.innerHTML =(data.html === "<br>" || data.html === "<div><br></div>")? "": (data.html || "");
                /*td.innerHTML = data.html || "";*/
                td.style.backgroundColor = data.bg || couleur;
                td.style.color = data.color || "";
                td.style.fontWeight = data.weight || "";
            }
             // =========================
            // SAVE ANCIEN ETAT (focus)
            // =========================
            td.addEventListener("focus", () => {

                td.dataset.oldHtml = td.innerHTML;
                td.dataset.oldBg = window.getComputedStyle(td).backgroundColor;
                td.dataset.oldColor = td.style.color;
                td.dataset.oldWeight = td.style.fontWeight;

            });


            td.addEventListener("blur", () => {
                        if (td.textContent.trim() === "") {
                            td.innerHTML = "";
                        }
                        const oldHtml = td.dataset.oldHtml || "";
                        const oldBg = td.dataset.oldBg || "";
                        const oldColor = td.dataset.oldColor || "";
                        const oldWeight = td.dataset.oldWeight || "";

                        const changed =
                            oldHtml !== td.innerHTML ||
                            oldBg !== td.style.backgroundColor ||
                            oldColor !== td.style.color ||
                            oldWeight !== td.style.fontWeight;

                        if (!changed) return;
                       /*  console.log("AVANT COULEUR =", td.dataset.oldBg);
                        console.log("APRES COULEUR =", td.style.backgroundColor); */
                        undoStack.push({

                         dateISO,
                        ligne:1, // ou 0 selon ROW

                        empId:emp.id,

                        before:{
                            html: oldHtml,
                            bg: window.getComputedStyle(td).backgroundColor,
                            color: oldColor,
                            weight: oldWeight
                        },

                        after:{
                            html: td.innerHTML,
                            bg: window.getComputedStyle(td).backgroundColor,
                            color: td.style.color,
                            weight: td.style.fontWeight
                        }

                                    });

                redoStack = [];
                 /* console.log("SAVE FIREBASE", {
                    html: td.innerHTML,
                    bg: window.getComputedStyle(td).backgroundColor,
                    color: td.style.color,
                    weight: td.style.fontWeight
                }); */
                if (td.textContent.trim() === "") {
                    td.innerHTML = "";
                }
                updateCell(dateISO, 1, emp.id, {
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

    renderLock = false;
    setTimeout(() => {
        activerDragAndDropColonnes();
        rendreHeadersInteractifs();
        autoResizeHeaders();
        refreshEmployeSelect();
        initUI();
    }, 0);
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
export function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}

function undo() {
    while (
        undoStack.length &&
        JSON.stringify(undoStack[undoStack.length - 1].before) ===
        JSON.stringify(undoStack[undoStack.length - 1].after)
    ) 
    {
        undoStack.pop();
    }
    const change = undoStack.pop();

    if (!change) return;
    /* console.log("UNDO STACK SIZE =", undoStack.length);
    console.log("UNDO =", change);
    console.log("BEFORE =", change.before);
    console.log("AFTER =", change.after); */
    const cell = document.querySelector(
    `[data-date="${change.dateISO}"][data-ligne="${change.ligne}"][data-emp-id="${change.empId}"]`
    );

    if (!cell) return;

    const data = change.before;

    cell.innerHTML=data.html;
    cell.style.backgroundColor=data.bg;
    cell.style.color=data.color;
    cell.style.fontWeight=data.weight;

    redoStack.push(change);

    updateCell(
        change.dateISO,
        change.ligne,
        change.empId,
        data
    );
}
function redo() {
     const change = redoStack.pop();

    if (!change) return;

    const cell = document.querySelector(
      `[data-date="${change.dateISO}"][data-ligne="${change.ligne}"][data-emp-id="${change.empId}"]`
    );

    if (!cell) return;

    const data = change.after;

    cell.innerHTML=data.html;
    cell.style.backgroundColor=data.bg;
    cell.style.color=data.color;
    cell.style.fontWeight=data.weight;

    undoStack.push(change);

    updateCell(
        change.dateISO,
        change.ligne,
        change.empId,
        data
    );
}
window.undo = undo;
window.redo = redo;
