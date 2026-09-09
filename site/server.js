const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

const publicPath = path.join(__dirname, "public");
const pagesPath = path.join(publicPath, "pages");

// CSS, JS, images vb. dosyaları public üzerinden sun
app.use(express.static(publicPath));


// =========================
// ANA SAYFA
// =========================

app.get("/", (req, res) => {
    res.sendFile(path.join(pagesPath, "index.html"));
});


// =========================
// LOGIN
// =========================

app.get("/login", (req, res) => {
    res.sendFile(path.join(pagesPath, "login.html"));
});


// =========================
// REGISTER
// =========================

app.get("/register", (req, res) => {
    res.sendFile(path.join(pagesPath, "register.html"));
});


// =========================
// SERVER
// =========================


app.listen(PORT, "0.0.0.0", () => {
    console.log("");
    console.log("================================");
    console.log("   SERVER AKTİF");
    console.log("================================");
    console.log(`   http://localhost:${PORT}`);
    console.log(`   http://localhost:${PORT}/login`);
    console.log(`   http://localhost:${PORT}/register`);
    console.log("================================");
    console.log("");
});