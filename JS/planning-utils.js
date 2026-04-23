

// ======================================================
// JOURS FÉRIÉS
// ======================================================

function calculerPaques(annee) {
    const a = annee % 19;
    const b = Math.floor(annee / 100);
    const c = annee % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mois = Math.floor((h + l - 7 * m + 114) / 31);
    const jour = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(annee, mois - 1, jour);
}

function getJoursFeries(annee) {
    const feries = [
        new Date(annee, 0, 1),
        new Date(annee, 4, 1),
        new Date(annee, 4, 8),
        new Date(annee, 6, 14),
        new Date(annee, 7, 15),
        new Date(annee, 10, 1),
        new Date(annee, 10, 11),
        new Date(annee, 11, 25)
    ];

    const paques = calculerPaques(annee);
    const lundiPaques = new Date(paques);
    lundiPaques.setDate(paques.getDate() + 1);

    const ascension = new Date(paques);
    ascension.setDate(paques.getDate() + 39);

    feries.push(lundiPaques, ascension);

    return feries.map(d => d.toISOString().split("T")[0]);
}

