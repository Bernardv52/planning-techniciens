export const user = {
    id: crypto.randomUUID(),
    name: prompt("Nom ?"),
    color: `hsl(${Math.random() * 360},70%,60%)`
};