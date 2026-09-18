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

const giveawayFile = path.join(
    __dirname,
    "giveaway-participants.json"
);

if (!fs.existsSync(giveawayFile)) {
    fs.writeFileSync(
        giveawayFile,
        "[]",
        "utf8"
    );
}

console.log("GIVEAWAY API AKTİF:", giveawayFile);
app.post("/api/giveaway/join", async (req, res) => {

    try {

        const playerId =
            String(req.body.playerId || "").trim();

        const zoneId =
            String(req.body.zoneId || "").trim();

        const name =
            String(req.body.name || "").trim();


        // -------------------------
        // INPUT KONTROLÜ
        // -------------------------

        if (!playerId || !zoneId || !name) {

            return res.status(400).json({
                success: false,
                message: "Oyuncu bilgileri eksik."
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


        // -------------------------
        // KAYITLARI OKU
        // -------------------------

        let participants = [];

        try {

            const fileData =
                fs.readFileSync(
                    giveawayFile,
                    "utf8"
                );

            participants =
                JSON.parse(fileData);

            if (!Array.isArray(participants)) {
                participants = [];
            }

        } catch (error) {

            console.error(
                "ÇEKİLİŞ DOSYASI OKUMA HATASI:",
                error
            );

            participants = [];

        }


        // -------------------------
        // AYNI ID KONTROLÜ
        // -------------------------

        const alreadyJoined =
            participants.some(
                participant =>
                    String(participant.playerId) === playerId
            );


        if (alreadyJoined) {

            return res.status(409).json({
                success: false,
                message:
                    "Bu oyuncu ID'si çekilişe daha önce katılmış."
            });

        }


        // -------------------------
        // KAYIT
        // -------------------------

        const participant = {

            playerId: playerId,

            zoneId: zoneId,

            name: name,

            joinedAt:
                new Date().toISOString()

        };


        participants.push(participant);


        // -------------------------
        // DOSYAYA YAZ
        // -------------------------

        fs.writeFileSync(
            giveawayFile,
            JSON.stringify(
                participants,
                null,
                2
            ),
            "utf8"
        );


        console.log(
            "ÇEKİLİŞ KAYDI:",
            participant
        );


        // -------------------------
        // BAŞARILI
        // -------------------------

        return res.json({

            success: true,

            message:
                `${name} çekilişe başarıyla katıldı.`

        });


    } catch (error) {

        console.error(
            "ÇEKİLİŞ KATILIM HATASI:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Çekilişe kayıt sırasında sunucu hatası oluştu."

        });

    }

});

// =========================================================
// MLBB - ID CHECKER 
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
// SERVİCES
// =========================================================

app.get("/services", (req, res) => {

    res.sendFile(
        path.join(
            pagesPath,
            "services.html"
        )
    );

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
            `   http://localhost:${PORT}/herowinlose`
        );

        console.log(
            `   http://localhost:${PORT}/admin`
        );

        console.log(
           `   http://localhost:${PORT}/services`
        );


    }
);