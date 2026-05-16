const express = require("express");
const path = require("path");

const app = express();

app.use(express.static("public"));

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});