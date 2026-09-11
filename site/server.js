const express = require("express");
const session = require("express-session");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const serviceAccount = require("./firebase-service-account.json");

initializeApp({
    credential: cert(serviceAccount)
});

const { getAuth } = require("firebase-admin/auth");

const adminAuth = getAuth();

const app = express();
const PORT = 3001;

const publicPath = path.join(__dirname, "public");
const pagesPath = path.join(publicPath, "pages");
const mlbbPath = path.join(pagesPath, "mlbb");


// =========================
// MIDDLEWARE
// =========================

app.use(express.static(publicPath));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "kaewayn-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));


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
// LOGOUT
// =========================

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            console.error("Logout hatası:", err);
            return res.redirect("/");
        }

        res.clearCookie("connect.sid");
        res.redirect("/");

    });

});


// =========================
// MLBB - WIN RATE
// =========================

app.get("/winrate", (req, res) => {
    res.sendFile(path.join(mlbbPath, "winrate.html"));
});


// =========================
// MLBB - ID CHECKER
// =========================

app.get("/id-checker", (req, res) => {
    res.sendFile(path.join(mlbbPath, "id-checker.html"));
});


// =========================
// MLBB - HESAP YAŞI
// =========================

app.get("/hesap-yasi", (req, res) => {
    res.sendFile(path.join(mlbbPath, "hesap-yasi.html"));
});


// =========================
// MLBB - DEĞERLEME
// =========================

app.get("/degerleme", (req, res) => {
    res.sendFile(path.join(mlbbPath, "degerleme.html"));
});


// =========================
// MLBB - HERO WIN LOSE
// =========================

app.get("/herowinlose", (req, res) => {
    res.sendFile(path.join(mlbbPath, "herowinlose.html"));
});


// =========================
// MLBB - RÜTBE
// =========================

app.get("/rutbe", (req, res) => {
    res.sendFile(path.join(mlbbPath, "rutbe.html"));
});


// =========================
// MLBB - ZODYAK
// =========================

app.get("/zodyak", (req, res) => {
    res.sendFile(path.join(mlbbPath, "zodyak.html"));
});


// =========================
// MLBB - YILDIZ
// =========================

app.get("/yildiz", (req, res) => {
    res.sendFile(path.join(mlbbPath, "yildiz.html"));
});


// =========================
// MLBB - ASPIRANT
// =========================

app.get("/aspirant", (req, res) => {
    res.sendFile(path.join(mlbbPath, "aspirant.html"));
});


// =========================
// MLBB - BÜYÜLÜ ÇARK
// =========================

app.get("/buyulu-cark", (req, res) => {
    res.sendFile(path.join(mlbbPath, "buyulu-cark.html"));
});


// =========================
// MLBB - BINGO
// =========================

app.get("/bingo", (req, res) => {
    res.sendFile(path.join(mlbbPath, "bingo.html"));
});


// =========================
// ADMIN
// =========================


app.get("/admin", (req, res) => {

    res.sendFile(path.join(pagesPath, "admin.html"));

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
    console.log("");
    console.log("   MLBB");
    console.log(`   http://localhost:${PORT}/winrate`);
    console.log(`   http://localhost:${PORT}/id-checker`);
    console.log(`   http://localhost:${PORT}/hesap-yasi`);
    console.log(`   http://localhost:${PORT}/degerleme`);
    console.log(`   http://localhost:${PORT}/herowinlose`);
    console.log(`   http://localhost:${PORT}/rutbe`);
    console.log(`   http://localhost:${PORT}/zodyak`);
    console.log(`   http://localhost:${PORT}/yildiz`);
    console.log(`   http://localhost:${PORT}/aspirant`);
    console.log(`   http://localhost:${PORT}/buyulu-cark`);
    console.log(`   http://localhost:${PORT}/bingo`);
    console.log(`   http://localhost:${PORT}/admin`);
    console.log("================================");
    console.log("");

});