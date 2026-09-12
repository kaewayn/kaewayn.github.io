const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./firebase-service-account.json");


// =========================================================
// FIREBASE
// =========================================================

initializeApp({
    credential: cert(serviceAccount)
});

const adminAuth = getAuth();


// =========================================================
// EXPRESS
// =========================================================

const app = express();
const PORT = 3001;


// =========================================================
// DOSYA YOLLARI
// =========================================================

const publicPath = path.join(__dirname, "public");
const pagesPath = path.join(publicPath, "pages");
const mlbbPath = path.join(pagesPath, "mlbb");


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(express.static(publicPath));

app.use(express.urlencoded({
    extended: true
}));

app.use(express.json());

app.use(session({
    secret: "kaewayn-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));


// =========================================================
// ANA SAYFA
// =========================================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(pagesPath, "index.html")
    );

});


// =========================================================
// LOGIN
// =========================================================

app.get("/login", (req, res) => {

    res.sendFile(
        path.join(pagesPath, "login.html")
    );

});


// =========================================================
// REGISTER
// =========================================================

app.get("/register", (req, res) => {

    res.sendFile(
        path.join(pagesPath, "register.html")
    );

});


// =========================================================
// LOGOUT
// =========================================================

app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {

            console.error(
                "Logout hatası:",
                err
            );

            return res.redirect("/");

        }

        res.clearCookie("connect.sid");

        res.redirect("/");

    });

});


// =========================================================
// MLBB - WIN RATE
// =========================================================

app.get("/winrate", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "winrate.html"
        )
    );

});


// =========================================================
// MLBB - ID CHECKER API
// =========================================================

app.get("/api/id-checker", async (req, res) => {

    try {

        const playerId = String(req.query.playerId || "").trim();
        const zoneId = String(req.query.zoneId || "").trim();

        if (!playerId || !zoneId) {
            return res.status(400).json({
                success: false,
                message: "Oyuncu ID ve Zone ID gerekli."
            });
        }

        if (!/^\d+$/.test(playerId)) {
            return res.status(400).json({
                success: false,
                message: "Oyuncu ID yalnızca rakamlardan oluşmalıdır."
            });
        }

        if (!/^\d+$/.test(zoneId)) {
            return res.status(400).json({
                success: false,
                message: "Zone ID yalnızca rakamlardan oluşmalıdır."
            });
        }

const apiUrl =
    `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(playerId)}&server=${encodeURIComponent(zoneId)}&decode=false`;

        console.log("MLBB API İSTEĞİ:", apiUrl);

        const response = await fetch(apiUrl);

        const data = await response.json();

        console.log("MLBB API CEVABI:", data);

        if (!response.ok || !data.success) {

            return res.status(404).json({
                success: false,
                message: "Bu ID ve Zone ID ile oyuncu bulunamadı."
            });

        }

        return res.json({
            success: true,
            playerId: String(data.id || playerId),
            zoneId: String(data.server || zoneId),
            name: data.name || "Bilinmiyor",
            country: data.country || "",
            game: data.game || "Mobile Legends: Bang Bang"
        });

    } catch (error) {

        console.error("MLBB ID Checker HATASI:", error);

        return res.status(500).json({
            success: false,
            message: "MLBB oyuncu servisine bağlanılamadı."
        });

    }

});

// =========================================================
// ÇEKİLİŞ - KATILIM API
// =========================================================

const giveawayFile = path.join(__dirname, "giveaway-participants.json");

if (!fs.existsSync(giveawayFile)) {
    fs.writeFileSync(
        giveawayFile,
        JSON.stringify([], null, 2),
        "utf8"
    );
}

app.post("/api/giveaway/join", async (req, res) => {

    try {

        const playerId = String(req.body.playerId || "").trim();
        const zoneId = String(req.body.zoneId || "").trim();

        // ID + ZONE KONTROLÜ
        if (!playerId || !zoneId) {
            return res.status(400).json({
                success: false,
                message: "Oyuncu ID ve Zone ID gerekli."
            });
        }

        if (!/^\d+$/.test(playerId) || !/^\d+$/.test(zoneId)) {
            return res.status(400).json({
                success: false,
                message: "ID ve Zone ID yalnızca rakamlardan oluşmalıdır."
            });
        }

        // =====================================================
        // AYNI ID DAHA ÖNCE KATILMIŞ MI?
        // =====================================================

        const participants = JSON.parse(
            fs.readFileSync(giveawayFile, "utf8")
        );

        const alreadyJoined = participants.some(
            participant =>
                String(participant.playerId) === playerId
        );

        if (alreadyJoined) {
            return res.status(409).json({
                success: false,
                message: "Bu oyuncu ID'si çekilişe daha önce katılmış."
            });
        }

        // =====================================================
        // MEVCUT ID CHECKER'DA KULLANILAN MLBB API
        // =====================================================

        const apiUrl =
            `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(playerId)}&server=${encodeURIComponent(zoneId)}&decode=false`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        // =====================================================
        // HESAP BULUNAMADI
        // =====================================================

        if (!response.ok || !data.success || !data.name) {
            return res.status(404).json({
                success: false,
                message: "Bu ID ve Zone ID ile eşleşen oyuncu bulunamadı."
            });
        }

        // =====================================================
        // ÇEKİLİŞE KAYDET
        // =====================================================

        participants.push({
            playerId: String(data.id || playerId),
            zoneId: String(data.server || zoneId),
            name: data.name,
            country: data.country || "",
            joinedAt: new Date().toISOString()
        });

        fs.writeFileSync(
            giveawayFile,
            JSON.stringify(participants, null, 2),
            "utf8"
        );

        // =====================================================
        // BAŞARILI
        // =====================================================

        return res.json({
            success: true,
            message: `${data.name} çekilişe başarıyla katıldı.`,
            playerId: String(data.id || playerId),
            zoneId: String(data.server || zoneId),
            name: data.name
        });

    } catch (error) {

        console.error(
            "Çekiliş katılım hatası:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Çekilişe katılırken sunucu tarafında bir hata oluştu."
        });
    }

});

// =========================================================
// MLBB - ID CHECKER SAYFASI
// =========================================================

app.get("/id-checker", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "id-checker.html"
        )
    );

});


// =========================================================
// MLBB - HESAP YAŞI
// =========================================================

app.get("/hesap-yasi", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "hesap-yasi.html"
        )
    );

});


// =========================================================
// MLBB - DEĞERLEME
// =========================================================

app.get("/degerleme", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "degerleme.html"
        )
    );

});


// =========================================================
// MLBB - HERO WIN LOSE
// =========================================================

app.get("/herowinlose", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "herowinlose.html"
        )
    );

});


// =========================================================
// MLBB - RÜTBE
// =========================================================

app.get("/rutbe", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "rutbe.html"
        )
    );

});


// =========================================================
// MLBB - ZODYAK
// =========================================================

app.get("/zodyak", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "zodyak.html"
        )
    );

});


// =========================================================
// MLBB - YILDIZ
// =========================================================

app.get("/yildiz", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "yildiz.html"
        )
    );

});


// =========================================================
// MLBB - ASPIRANT
// =========================================================

app.get("/aspirant", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "aspirant.html"
        )
    );

});


// =========================================================
// MLBB - BÜYÜLÜ ÇARK
// =========================================================

app.get("/buyulu-cark", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "buyulu-cark.html"
        )
    );

});


// =========================================================
// MLBB - BINGO
// =========================================================

app.get("/bingo", (req, res) => {

    res.sendFile(
        path.join(
            mlbbPath,
            "bingo.html"
        )
    );

});


// =========================================================
// ADMIN - ÇEKİLİŞ KATILIMCILARI
// =========================================================

app.get("/api/admin/giveaway-participants", (req, res) => {

    try {

        if (!fs.existsSync(giveawayFile)) {
            return res.json({
                success: true,
                participants: []
            });
        }

        const participants = JSON.parse(
            fs.readFileSync(
                giveawayFile,
                "utf8"
            )
        );

        return res.json({
            success: true,
            participants: participants
        });

    } catch (error) {

        console.error(
            "Çekiliş katılımcıları okunamadı:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Katılımcılar yüklenemedi."
        });

    }

});


// =========================================================
// ADMIN
// =========================================================

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "admin.html"
        )
    );

});


// =========================================================
// ADMIN - ÇEKİLİŞ KATILIMCILARI
// =========================================================

app.get("/api/admin/giveaway-participants", (req, res) => {

    try {

        if (!fs.existsSync(giveawayFile)) {

            return res.json({
                success: true,
                participants: []
            });

        }

        const participants =
            JSON.parse(
                fs.readFileSync(
                    giveawayFile,
                    "utf8"
                )
            );

        return res.json({
            success: true,
            participants: participants
        });

    } catch (error) {

        console.error(
            "Çekiliş katılımcıları okunamadı:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Katılımcılar yüklenemedi."
        });

    }

});

// =========================================================
// ÇEKİLİŞ
// =========================================================

app.get("/cekilis", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "cekilis.html"
        )
    );

});




app.post("/api/giveaway/join", (req, res) => {

    console.log("CEKILIS POST GELDI:", req.body);

    return res.json({
        success: true,
        message: "TEST: Çekiliş API'si çalışıyor."
    });

});


// =========================================================
// SERVER
// =========================================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "================================"
        );

        console.log(
            "   KAEWAYN SERVER AKTİF"
        );

        console.log(
            "================================"
        );

        console.log(
            `   http://localhost:${PORT}`
        );

        console.log(
            `   http://localhost:${PORT}/login`
        );

        console.log(
            `   http://localhost:${PORT}/register`
        );

        console.log("");

        console.log(
            "   MLBB"
        );

        console.log(
            `   http://localhost:${PORT}/winrate`
        );

        console.log(
            `   http://localhost:${PORT}/id-checker`
        );

        console.log(
            `   http://localhost:${PORT}/hesap-yasi`
        );

        console.log(
            `   http://localhost:${PORT}/degerleme`
        );

        console.log(
            `   http://localhost:${PORT}/herowinlose`
        );

        console.log(
            `   http://localhost:${PORT}/rutbe`
        );

        console.log(
            `   http://localhost:${PORT}/zodyak`
        );

        console.log(
            `   http://localhost:${PORT}/yildiz`
        );

        console.log(
            `   http://localhost:${PORT}/aspirant`
        );

        console.log(
            `   http://localhost:${PORT}/buyulu-cark`
        );

        console.log(
            `   http://localhost:${PORT}/bingo`
        );

        console.log("");

        console.log(
            `   http://localhost:${PORT}/admin`
        );

                console.log(
            `   http://localhost:${PORT}/cekilis`
        );

        console.log(
            "================================"
        );

        console.log("");

    }
);