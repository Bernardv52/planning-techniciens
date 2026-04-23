async function sauvegarderPlanning() {
    const annee = parseInt(anneeSelect.value);
    const bloc = parseInt(blocSelect.value);

    const table = document.getElementById("planning");
    const headers = Array.from(table.querySelectorAll("thead th"))
        .slice(1)
        .map(th => th.textContent);
    const rows = table.querySelectorAll("tbody tr");

    const sauvegarde = { employes: headers, blocs: {} };
    sauvegarde.blocs[bloc] = { data: {} };

    for (let i = 0; i < rows.length; i += 2) {
        const row1 = rows[i];
        const row2 = rows[i + 1];
        const key = row1.querySelector(".date-cell").dataset.date;

        const ligne1 = Array.from(row1.querySelectorAll("td")).slice(1).map(td => td.innerText);
        const ligne2 = Array.from(row2.querySelectorAll("td")).map(td => td.innerText);

        sauvegarde.blocs[bloc].data[key] = [ligne1, ligne2];
    }

    // 🔹 Envoi automatique au serveur
    try {
        await fetch("/planning.json", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ [annee]: sauvegarde })
        });
        console.log("Planning sauvegardé sur serveur");
    } catch (err) {
        console.error("Erreur sauvegarde serveur :", err);
    }
}

async function chargerPlanning() {
    const annee = parseInt(anneeSelect.value);
    try {
        const res = await fetch("/planning.json");
        const data = await res.json();
        if (!data[annee]) return;

        // Charger les blocs et les valeurs comme précédemment
        // ...
    } catch (err) {
        console.error("Erreur chargement serveur :", err);
    }
}