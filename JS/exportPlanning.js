function getPlanningTableData() {
    const table = document.getElementById("planning");
    const headers = Array.from(table.querySelectorAll("thead th"))
        .map(th => th.textContent);

    const rows = table.querySelectorAll("tbody tr");

    let data = [];
    for (let i = 0; i < rows.length; i += 2) {

        const row1 = rows[i];
        const row2 = rows[i + 1];

        const date = row1.querySelector(".date-cell").textContent;

        const ligne1 = Array.from(row1.querySelectorAll("td"))
            .slice(1)
            .map(td => td.innerText);

        const ligne2 = Array.from(row2.querySelectorAll("td"))
            .map(td => td.innerText);

        data.push({
            date: date,
            ligne1: ligne1,
            ligne2: ligne2
        });
    }

    return { headers, data };
}
function exportCSV() {
    const { headers, data } = getPlanningTableData();

    // Séparateur français compatible Excel
    const separator = ";";

    // Échappe les guillemets et protège les cellules
    const quote = (value) => {
        if (value === null || value === undefined) return '""';
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
    };

    let csvLines = [];

    // Ligne d'en-tête
    csvLines.push(headers.map(quote).join(separator));

    // Lignes de données
    data.forEach(jour => {

        // Première ligne (avec date)
        csvLines.push(
            [quote(jour.date), ...jour.ligne1.map(quote)].join(separator)
        );

        // Deuxième ligne (sans date)
        csvLines.push(
            [quote(""), ...jour.ligne2.map(quote)].join(separator)
        );
    });

    // Fusion des lignes
    const csvContent = csvLines.join("\r\n");

    // Ajout BOM UTF-8 pour Excel
    const blob = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8;" }
    );

    // Téléchargement
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "planning.csv";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
}
function exportXLSX() {
    const table = document.getElementById("planning");
    const wb = XLSX.utils.table_to_book(table, { sheet: "Planning" });

    XLSX.writeFile(wb, "planning.xlsx");
}
async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const annee = document.getElementById("anneeSelect").value;
    const bloc = document.getElementById("moisSelect").value;

    function getPeriode(num) {
        switch (num) {
            case "1": return "Janv-Avril";
            case "2": return "Mai-Août";
            case "3": return "Sept-Decembre";
            default: return "";
        }
    }

    const quadrimestre = getPeriode(bloc);
    const titre = `Planning ${quadrimestre} - ${annee}`;
    const dateGen = new Date().toLocaleDateString("fr-FR");

    // ===== Logo =====
    const logo = new Image();
    logo.src = "Logo/Logo.png";
    logo.onload = () => {

        doc.addImage(logo, "PNG", 10, 8, 30, 15);

        // ===== Titres =====
        doc.setFontSize(16);
        doc.text(titre, 45, 15);
        doc.setFontSize(10);
        doc.text(`Généré le ${dateGen}`, 45, 22);

        // ===== Largeurs dynamiques =====
        const table = document.getElementById("planning");
        const nbColonnes = table.querySelectorAll("thead th").length;
        const pageWidth = doc.internal.pageSize.getWidth() - 40; // marge gauche + droite
        const dateColWidth = 12;
        const remainingWidth = pageWidth - dateColWidth;
        const dataColWidth = remainingWidth / (nbColonnes - 1);

        // ===== Tableau =====
        doc.autoTable({
            html: "#planning",
            startY: 30,
            theme: "grid",
            margin: { left: 10, right: 10 },

            styles: {
                fontSize: 7,
                cellPadding: 1.5,
                valign: "middle",
                halign: "center",
                overflow: "linebreak",   // 🔥 force retour à la ligne
                cellWidth: dataColWidth  // 🔥 largeur FIXE
            },

            columnStyles: {
                0: { cellWidth: dateColWidth }  // colonne DATE fixe
            },
        
        didParseCell: function(data) {
            const cell = data.cell.raw;
        if (!cell) return;

        // 🔹 Fond (reste sur le TD)
        const cellStyle = getComputedStyle(cell);
        const bg = cssToRgb(cellStyle.backgroundColor);
        if (bg) data.cell.styles.fillColor = bg;

        // 🔹 Cherche un élément interne stylé
        const styledChild = cell.querySelector("span, b, strong");

        if (styledChild) {
            const innerStyle = getComputedStyle(styledChild);

            // Couleur texte
            const textColor = cssToRgb(innerStyle.color);
            if (textColor) data.cell.styles.textColor = textColor;

            // Gras
            if (innerStyle.fontWeight === "700" || innerStyle.fontWeight === "bold") {
                data.cell.styles.fontStyle = "bold";
            }
        } else {
            // fallback si pas de span
            const textColor = cssToRgb(cellStyle.color);
            if (textColor) data.cell.styles.textColor = textColor;

            if (cellStyle.fontWeight === "700" || cellStyle.fontWeight === "bold") {
                data.cell.styles.fontStyle = "bold";
            }
        }
        }
        });

        doc.save(`Planning_Tech_${quadrimestre}_${annee}.pdf`);
    };

    logo.onerror = () => {
        console.log("Logo introuvable → export sans logo");

        // Même export sans logo
        const table = document.getElementById("planning");
        const nbColonnes = table.querySelectorAll("thead th").length;
        const pageWidth = doc.internal.pageSize.getWidth() - 40;
        const dateColWidth = 12;
        const remainingWidth = pageWidth - dateColWidth;
        const dataColWidth = (remainingWidth * 0.95) / (nbColonnes - 1);

        doc.autoTable({
            html: "#planning",
            startY: 30,
            theme: "grid",
            margin: { left: 10, right: 10 },

            styles: {
                fontSize: 7,
                cellPadding: 1.5,
                valign: "middle",
                halign: "center",
                overflow: "linebreak",   // 🔥 force retour à la ligne
                cellWidth: dataColWidth  // 🔥 largeur FIXE
            },

            columnStyles: {
                0: { cellWidth: dateColWidth }  // colonne DATE fixe
            },
        didParseCell: function(data) {
            const cell = data.cell.raw;
        if (!cell) return;

        // 🔹 Fond (reste sur le TD)
        const cellStyle = getComputedStyle(cell);
        const bg = cssToRgb(cellStyle.backgroundColor);
        if (bg) data.cell.styles.fillColor = bg;

        // 🔹 Cherche un élément interne stylé
        const styledChild = cell.querySelector("span, b, strong");

        if (styledChild) {
            const innerStyle = getComputedStyle(styledChild);

            // Couleur texte
            const textColor = cssToRgb(innerStyle.color);
            if (textColor) data.cell.styles.textColor = textColor;

            // Gras
            if (innerStyle.fontWeight === "700" || innerStyle.fontWeight === "bold") {
                data.cell.styles.fontStyle = "bold";
            }
        } else {
            // fallback si pas de span
            const textColor = cssToRgb(cellStyle.color);
            if (textColor) data.cell.styles.textColor = textColor;

            if (cellStyle.fontWeight === "700" || cellStyle.fontWeight === "bold") {
                data.cell.styles.fontStyle = "bold";
            }
        }
        }
            
        });

        doc.save(`Planning_Tech_${quadrimestre}_${annee}.pdf`);
    };
}
// ===== Utilitaire pour convertir CSS rgb → [r,g,b] =====
function cssToRgb(cssColor) {
    if(!cssColor) return null;
    const m = cssColor.match(/^rgb\s*\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/);
    if(m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
    return null;
}
async function exportDOCX() {
    const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun } = window.docx;

    const tableHTML = document.getElementById("planning");
    const tbodyRows = Array.from(tableHTML.querySelectorAll("tr"));

    const rowsDOCX = [];

    tbodyRows.forEach(tr => {
        const cells = Array.from(tr.children);
        const row = new TableRow({
            children: cells.map(cell => {
                const options = {
                    children: [new Paragraph({ children: [new TextRun(cell.innerText)] })]
                };
                if (cell.rowSpan && cell.rowSpan > 1) options.rowSpan = cell.rowSpan;
                if (cell.colSpan && cell.colSpan > 1) options.columnSpan = cell.colSpan;
                return new TableCell(options);
            })
        });
        rowsDOCX.push(row);
    });

    const doc = new Document({
        sections: [{
            children: [new Table({ rows: rowsDOCX })]
        }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "planning.docx");

}
document.getElementById("exportBtn").addEventListener("click", async function(){
    // 🔥 laisse le temps au render de finir
    await new Promise(r => setTimeout(r, 50));
    const format = document.getElementById("exportFormat").value;

    if(format === "csv") exportCSV();
    if(format === "xlsx") exportXLSX();
    if(format === "pdf") exportPDF();
    if(format === "docx") exportDOCX();
});
