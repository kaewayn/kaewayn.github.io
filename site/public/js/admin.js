import { db } from "./firebase.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const auth = getAuth();

const ADMIN_EMAIL = "kaewayn@gmail.com";

import {
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    addDoc,
    orderBy,
    limit,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


function showAdminToast(message) {
    if (typeof showToast === "function") {
        showToast(message);
    } else {
        console.log(message);
    }
}

onAuthStateChanged(auth, (user) => {

    if (!user || user.email !== ADMIN_EMAIL) {

        document.body.innerHTML = `
            <div style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                text-align:center;
                color:white;
                background:#050505;
                font-family:Arial,sans-serif;
            ">
                <div>
                    <h1 style="font-size:64px;margin:0 0 10px;">
                         ADMIN
                    </h1>

                    <h2>
                        Admin girişine yetkiniz yoktur.
                    </h2>

                    <p>
                       
                    </p>

                    <a href="/" style="color:white;">
                      
                    </a>
                </div>
            </div>
        `;

        return;
    }

});


document.addEventListener("DOMContentLoaded", async () => {

    // ==================================================
    // ELEMANLAR
    // ==================================================

    const userSearch =
        document.getElementById("userSearch");

    const userList =
        document.getElementById("userList");

    const totalUsers =
        document.getElementById("totalUsers");

    const premiumUsers =
        document.getElementById("premiumUsers");

    const verifiedUsers =
        document.getElementById("verifiedUsers");

    const recentUsers =
        document.getElementById("recentUsers");

    const selectedUsername =
        document.getElementById("selectedUsername");

    const selectedEmail =
        document.getElementById("selectedEmail");

    const premiumStatus =
        document.getElementById("premiumStatus");

    const verifiedStatus =
        document.getElementById("verifiedStatus");

    const premiumButton =
        document.getElementById("premiumButton");

    const verifiedButton =
        document.getElementById("verifiedButton");


    let users = [];
    let selectedUser = null;

    


    // ==================================================
    // KULLANICILARI GETİR
    // ==================================================

    async function loadUsers() {

        try {

            const snapshot =
                await getDocs(
                    collection(db, "users")
                );

            users = [];

            snapshot.forEach((userDoc) => {

                users.push({
                    id: userDoc.id,
                    ...userDoc.data()
                });

            });


            // İSTATİSTİKLER

            totalUsers.textContent =
                users.length;

            premiumUsers.textContent =
                users.filter(
                    user => user.premium === true
                ).length;

            verifiedUsers.textContent =
                users.filter(
                    user => user.verified === true
                ).length;

            recentUsers.textContent =
                users.length;


            renderUsers(users);

        } catch (error) {

            console.error(
                "KULLANICILAR YÜKLENEMEDİ:",
                error
            );

            userList.innerHTML = `
                <div class="empty-state">

                    <i class="fas fa-triangle-exclamation"></i>

                    <h3>
                        Kullanıcılar yüklenemedi
                    </h3>

                    <p>
                        Firebase bağlantısını kontrol et.
                    </p>

                </div>
            `;

        }

    }


    // ==================================================
    // KULLANICILARI GÖSTER
    // ==================================================

    function renderUsers(list) {

        if (!list.length) {

            userList.innerHTML = `
                <div class="empty-state">

                    <i class="fas fa-user-slash"></i>

                    <h3>
                        Kullanıcı bulunamadı
                    </h3>

                    <p>
                        Arama sonucunda kullanıcı yok.
                    </p>

                </div>
            `;

            return;
        }


        userList.innerHTML =
            list.map(user => `

                <div class="user-item">

                    <div class="user-item-left">

                        <div class="user-avatar">
                            ${user.username
                                ? user.username
                                    .charAt(0)
                                    .toUpperCase()
                                : "?"}
                        </div>

                        <div class="user-item-info">

                            <strong>
                                ${user.username || "İsimsiz"}
                            </strong>

                            <span>
                                ${user.email || "E-posta yok"}
                            </span>

                        </div>

                    </div>


                    <button
                        type="button"
                        class="user-item-button"
                        data-user-id="${user.id}"
                    >
                        Yönet
                    </button>

                </div>

            `).join("");


        document
            .querySelectorAll(".user-item-button")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const user =
                            users.find(
                                item =>
                                    item.id ===
                                    button.dataset.userId
                            );

                        if (!user) return;

                        selectUser(user);

                    }
                );

            });

    }


    // ==================================================
    // KULLANICI SEÇ
    // ==================================================

    function selectUser(user) {

        selectedUser = user;


        selectedUsername.textContent =
            user.username || "İsimsiz";

        selectedEmail.textContent =
            user.email || "E-posta yok";


        premiumStatus.textContent =
            user.premium === true
                ? "Aktif"
                : "Pasif";

        verifiedStatus.textContent =
            user.verified === true
                ? "Aktif"
                : "Pasif";


        premiumButton.textContent =
            user.premium === true
                ? "Premium Kaldır"
                : "Premium Ver";


        verifiedButton.textContent =
            user.verified === true
                ? "Mavi Tik Kaldır"
                : "Mavi Tik Ver";

    }


    // ==================================================
    // KULLANICI ARAMA
    // ==================================================

    userSearch.addEventListener(
        "input",
        () => {

            const search =
                userSearch.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                renderUsers(users);

                return;

            }


            const filtered =
                users.filter(user => {

                    const username =
                        (user.username || "")
                            .toLowerCase();

                    const email =
                        (user.email || "")
                            .toLowerCase();


                    return (
                        username.includes(search) ||
                        email.includes(search)
                    );

                });


            renderUsers(filtered);

        }
    );


    // ==================================================
    // PREMIUM VER / KALDIR
    // ==================================================

    premiumButton.addEventListener(
        "click",
        async () => {

            if (!selectedUser) {

                alert(
                    "Önce bir kullanıcı seç."
                );

                return;

            }


            try {

                const newStatus =
                    selectedUser.premium !== true;


                await updateDoc(
                    doc(
                        db,
                        "users",
                        selectedUser.id
                    ),
                    {
                        premium: newStatus
                    }
                );


                selectedUser.premium =
                    newStatus;


                premiumStatus.textContent =
                    newStatus
                        ? "Aktif"
                        : "Pasif";


                premiumButton.textContent =
                    newStatus
                        ? "Premium Kaldır"
                        : "Premium Ver";


                        showAdminToast(
    newStatus
        ? "Premium verildi."
        : "Premium kaldırıldı."
);


                premiumUsers.textContent =
                    users.filter(
                        user =>
                            user.premium === true
                    ).length;


            } catch (error) {

                console.error(
                    "PREMIUM ERROR:",
                    error
                );

                alert(
                    "Premium işlemi başarısız."
                );

            }

        }
    );


    // ==================================================
    // MAVİ TİK VER / KALDIR
    // ==================================================

    verifiedButton.addEventListener(
        "click",
        async () => {

            if (!selectedUser) {

                alert(
                    "Önce bir kullanıcı seç."
                );

                return;

            }


            try {

                const newStatus =
                    selectedUser.verified !== true;


                await updateDoc(
                    doc(
                        db,
                        "users",
                        selectedUser.id
                    ),
                    {
                        verified: newStatus
                    }
                );


                selectedUser.verified =
                    newStatus;


                verifiedStatus.textContent =
                    newStatus
                        ? "Aktif"
                        : "Pasif";


                verifiedButton.textContent =
                    newStatus
                        ? "Mavi Tik Kaldır"
                        : "Mavi Tik Ver";


                        showAdminToast(
    newStatus
        ? "Mavi tik verildi."
        : "Mavi tik kaldırıldı."
);


                verifiedUsers.textContent =
                    users.filter(
                        user =>
                            user.verified === true
                    ).length;


            } catch (error) {

                console.error(
                    "VERIFIED ERROR:",
                    error
                );

                alert(
                    "Mavi tik işlemi başarısız."
                );

            }

        }
    );


// ==================================================
// ÇEKİLİŞ KATILIMCILARI
// ==================================================

let giveawayParticipants = [];
let giveawayCurrentPage = 1;

const GIVEAWAY_PER_PAGE = 5;


async function loadGiveawayParticipants() {

    const list =
        document.getElementById(
            "giveawayParticipantList"
        );

    const count =
        document.getElementById(
            "giveawayParticipantCount"
        );

    try {

const response = await fetch(
    "/api/admin/giveaway-participants?t=" + Date.now()
);

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Katılımcılar yüklenemedi."
            );

        }

        giveawayParticipants =
            data.participants || [];

        count.textContent =
            giveawayParticipants.length;

        giveawayCurrentPage = 1;

        renderGiveawayParticipants();

    } catch (error) {

        console.error(
            "Çekiliş katılımcıları:",
            error
        );

        list.innerHTML = `
            <div class="empty-state">

                <i class="fas fa-triangle-exclamation"></i>

                <h3>
                    Katılımcılar yüklenemedi
                </h3>

                <p>
                    Sunucu bağlantısını kontrol et.
                </p>

            </div>
        `;

    }

}


// ==================================================
// ÇEKİLİŞ KATILIMCILARINI GÖSTER
// ==================================================

function renderGiveawayParticipants() {

    const list =
        document.getElementById(
            "giveawayParticipantList"
        );

    const pageInfo =
        document.getElementById(
            "giveawayPageInfo"
        );

    const prevButton =
        document.getElementById(
            "giveawayPrevPage"
        );

    const nextButton =
        document.getElementById(
            "giveawayNextPage"
        );


    if (!giveawayParticipants.length) {

        list.innerHTML = `
            <div class="empty-state">

                <i class="fas fa-gift"></i>

                <h3>
                    Henüz katılımcı yok
                </h3>

                <p>
                    Çekilişe katılan oyuncular burada görünecek.
                </p>

            </div>
        `;

        pageInfo.textContent = "1 / 1";

        prevButton.disabled = true;
        nextButton.disabled = true;

        return;
    }


    const totalPages =
        Math.ceil(
            giveawayParticipants.length /
            GIVEAWAY_PER_PAGE
        );


    if (giveawayCurrentPage > totalPages) {
        giveawayCurrentPage = totalPages;
    }


    const startIndex =
        (giveawayCurrentPage - 1) *
        GIVEAWAY_PER_PAGE;


    const pageParticipants =
        giveawayParticipants
            .slice()
            .reverse()
            .slice(
                startIndex,
                startIndex + GIVEAWAY_PER_PAGE
            );


    list.innerHTML =
        pageParticipants
            .map((participant, index) => {

                const realNumber =
                    startIndex + index + 1;

                return `
                    <div class="giveaway-admin-item">

                        <div class="giveaway-admin-number">
                            ${realNumber}
                        </div>

                        <div class="giveaway-admin-info">

                            <strong>
                                ${participant.name || "Bilinmiyor"}
                            </strong>

                            <span>
                                ID: ${participant.playerId}
                            </span>

                            <span>
                                Zone ID: ${participant.zoneId}
                            </span>

                        </div>

                        <div class="giveaway-admin-date">

                            ${
                                participant.joinedAt
                                    ? new Date(
                                        participant.joinedAt
                                      ).toLocaleString(
                                          "tr-TR"
                                      )
                                    : "-"
                            }

                        </div>

                    </div>
                `;

            })
            .join("");


    pageInfo.textContent =
        `${giveawayCurrentPage} / ${totalPages}`;


    prevButton.disabled =
        giveawayCurrentPage <= 1;


    nextButton.disabled =
        giveawayCurrentPage >= totalPages;

}


// ==================================================
// ÖNCEKİ SAYFA
// ==================================================

document
    .getElementById("giveawayPrevPage")
    .addEventListener("click", () => {

        if (giveawayCurrentPage > 1) {

            giveawayCurrentPage--;

            renderGiveawayParticipants();

        }

    });


// ==================================================
// SONRAKİ SAYFA
// ==================================================

document
    .getElementById("giveawayNextPage")
    .addEventListener("click", () => {

        const totalPages =
            Math.ceil(
                giveawayParticipants.length /
                GIVEAWAY_PER_PAGE
            );

        if (giveawayCurrentPage < totalPages) {

            giveawayCurrentPage++;

            renderGiveawayParticipants();

        }

    });

    await loadGiveawayParticipants();

    // ==================================================
    // BAŞLAT
    // ==================================================

    await loadUsers();

});