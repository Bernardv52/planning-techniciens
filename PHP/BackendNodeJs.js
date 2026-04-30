// server.js
/* const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const jsonFile = path.join(__dirname, "planning.json");

app.use(bodyParser.json());
app.use(express.static("public")); // ton HTML/JS/CSS dans /public

// Récupérer le planning
app.get("/planning.json", (req, res) => {
    if (!fs.existsSync(jsonFile)) {
        fs.writeFileSync(jsonFile, JSON.stringify({}));
    }
    const data = fs.readFileSync(jsonFile);
    res.setHeader("Content-Type", "application/json");
    res.send(data);
});

// Sauvegarder le planning
app.post("/planning.json", (req, res) => {
    const data = req.body;
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2));
    res.send({ status: "ok" });
});

app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`)); */