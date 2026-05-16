const express = require("express");
const path = require("path");

const app = express();

// arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// exporta o app para a Vercel
module.exports = app;
