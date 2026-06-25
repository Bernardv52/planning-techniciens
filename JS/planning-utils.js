import { COLLECTION } from "./planning-core.js";

// ======================================================
// JOURS FÉRIÉS
// ======================================================

export function calculerPaques(annee) {
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

export function getJoursFeriesRaw(annee) {
    const feries = [
        { date: new Date(annee, 0, 1), nom: "Jour de l'an" },
        { date: new Date(annee, 4, 1), nom: "Fête du travail" },
        { date: new Date(annee, 4, 8), nom: "Victoire 1945" },
        { date: new Date(annee, 6, 14), nom: "Fête nationale" },
        { date: new Date(annee, 7, 15), nom: "Assomption" },
        { date: new Date(annee, 10, 1), nom: "Toussaint" },
        { date: new Date(annee, 10, 11), nom: "Armistice" },
        { date: new Date(annee, 11, 25), nom: "Noël" }
    ];

    const paques = calculerPaques(annee);
    const lundiPaques = new Date(paques);
    lundiPaques.setDate(paques.getDate() + 1);

    const ascension = new Date(paques);
    ascension.setDate(paques.getDate() + 39);
    const pentecoteLundi = new Date(paques);
    pentecoteLundi.setDate(paques.getDate() + 50);
    feries.push(
            { date: lundiPaques, nom: "Lundi de Pâques" },
            { date: ascension, nom: "Ascension" },
            { date: pentecoteLundi, nom: "Lundi de Pentecôte" }
        );
    // 👉 on trie par date
    feries.sort((a, b) => a.date - b.date);
    return feries;
}
export function getJoursFeries(annee) {
    return getJoursFeriesRaw(annee).map(f =>
        formatDateKey(f.date)
    );
}
/* export async function getJoursFeriesActifs(annee) {

    const feries = getJoursFeries(annee);

    const snap = await getDoc(doc(db, COLLECTION, String(annee)));

    if (!snap.exists()) return feries;

    const data = snap.data();

    const exclus = data.joursFeriesExclus || [];

    return feries.filter(f =>
        !exclus.includes(formatDateKey(f.date))
    );
} */
export function getDateRange(bloc, year) {

    let start, end;

    if (bloc === 1) {
        start = new Date(year, 0, 1);   // Janvier
        end   = new Date(year, 3, 30);  // Avril
    }

    if (bloc === 2) {
        start = new Date(year, 4, 1);   // Mai
        end   = new Date(year, 7, 31);  // Août
    }

    if (bloc === 3) {
        start = new Date(year, 8, 1);   // Septembre
        end   = new Date(year, 11, 31); // Décembre
    }

    return { start, end };
}
export function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

