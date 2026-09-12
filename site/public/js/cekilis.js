document.addEventListener("DOMContentLoaded", function () {

    const playerIdInput = document.getElementById("playerId");
    const zoneIdInput = document.getElementById("zoneId");
    const joinButton = document.getElementById("joinGiveaway");
    const message = document.getElementById("giveawayMessage");

    let verifiedAccount = null;

    // =====================================================
    // KATIL BUTONU
    // =====================================================

    joinButton.addEventListener("click", async function () {

        const playerId = playerIdInput.value.trim();
        const zoneId = zoneIdInput.value.trim();

        // =================================================
        // ONAYLA AŞAMASI
        // =================================================

        if (verifiedAccount) {

            joinButton.disabled = true;

            joinButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...';

            try {

                const response = await fetch(
                    "/api/giveaway/join",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

body: JSON.stringify({
    playerId: verifiedAccount.playerId,
    zoneId: verifiedAccount.zoneId,
    name: verifiedAccount.name
})
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.message ||
                        "Çekilişe katılım başarısız."
                    );
                }

                message.innerHTML = `
                    <strong>Çekilişe başarıyla katıldınız.</strong>
                    <br>
                    ${data.name}
                `;

                message.classList.add("show");

                joinButton.innerHTML =
                    '<i class="fa-solid fa-check"></i> Çekilişe Katıldınız';

                joinButton.disabled = true;

                playerIdInput.disabled = true;
                zoneIdInput.disabled = true;

                verifiedAccount = null;

            } catch (error) {

                console.error(
                    "Çekiliş kayıt hatası:",
                    error
                );

                message.textContent =
                    error.message ||
                    "Bir hata oluştu.";

                message.classList.add("show");

                joinButton.disabled = false;

                joinButton.innerHTML =
                    '<i class="fa-solid fa-check"></i> ONAYLA';
            }

            return;
        }

        // =================================================
        // INPUT KONTROLÜ
        // =================================================

        message.classList.remove("show");

        if (!playerId || !zoneId) {

            message.textContent =
                "Oyuncu ID ve Zone ID girin.";

            message.classList.add("show");

            return;
        }

        if (
            !/^\d+$/.test(playerId) ||
            !/^\d+$/.test(zoneId)
        ) {

            message.textContent =
                "ID ve Zone ID yalnızca rakamlardan oluşmalıdır.";

            message.classList.add("show");

            return;
        }

        // =================================================
        // HESAP DOĞRULANIYOR
        // =================================================

        joinButton.disabled = true;

        joinButton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Hesap kontrol ediliyor...';

        try {

            const response = await fetch(
                `/api/id-checker?playerId=${encodeURIComponent(playerId)}&zoneId=${encodeURIComponent(zoneId)}`
            );

            const data = await response.json();

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    "Hesap doğrulanamadı."
                );
            }

            // =================================================
            // HESABI GEÇİCİ OLARAK TUT
            // =================================================

            verifiedAccount = {
                playerId: String(data.playerId || playerId),
                zoneId: String(data.zoneId || zoneId),
                name: data.name || "Bilinmiyor"
            };

            // =================================================
            // KULLANICIYA ONAY EKRANI
            // =================================================

message.innerHTML = `
    <div class="giveaway-confirm">

        <div class="giveaway-confirm-title">
            Hesap doğrulandı
        </div>

        <div class="giveaway-player-name">
            ${verifiedAccount.name}
        </div>

        <div class="giveaway-confirm-info">
            Bilgiler doğruysa ONAYLA butonuna basın.
        </div>

    </div>
`;

            message.classList.add("show");

            joinButton.disabled = false;

            joinButton.innerHTML =
                '<i class="fa-solid fa-check"></i> ONAYLA';

        } catch (error) {

            console.error(
                "Hesap doğrulama hatası:",
                error
            );

            message.textContent =
                error.message ||
                "Hesap doğrulanamadı.";

            message.classList.add("show");

            joinButton.disabled = false;

            joinButton.innerHTML =
                '<i class="fa-solid fa-ticket"></i> Çekilişe Katıl';
        }

    });

});