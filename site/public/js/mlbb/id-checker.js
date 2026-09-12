document.addEventListener("DOMContentLoaded", function () {

    // =========================
    // ARAÇLAR MENÜSÜ
    // =========================

    const toolsButton = document.getElementById("toolsButton");
    const toolsMenu = document.getElementById("toolsMenu");
    const toolsArrow = document.getElementById("toolsArrow");

    if (toolsButton && toolsMenu) {

        toolsButton.addEventListener("click", function (event) {

            event.stopPropagation();

            const isOpen =
                toolsMenu.classList.toggle("active");

            if (toolsArrow) {
                toolsArrow.style.transform =
                    isOpen ? "rotate(180deg)" : "rotate(0deg)";
            }
        });

        document.addEventListener("click", function (event) {

            if (
                !toolsMenu.contains(event.target) &&
                !toolsButton.contains(event.target)
            ) {
                toolsMenu.classList.remove("active");

                if (toolsArrow) {
                    toolsArrow.style.transform = "rotate(0deg)";
                }
            }
        });
    }


    // =========================
    // ELEMENTLER
    // =========================

    const playerIdInput = document.getElementById("playerId");
    const zoneIdInput = document.getElementById("zoneId");
    const searchButton = document.getElementById("searchButton");
    const clearButton = document.getElementById("clearButton");

    const error = document.getElementById("error");
    const result = document.getElementById("result");

    const resultValue = document.getElementById("resultValue");
    const resultText = document.getElementById("resultText");

    const resultPlayerId =
        document.getElementById("resultPlayerId");

    const resultZoneId =
        document.getElementById("resultZoneId");

        const resultCountry =
    document.getElementById("resultCountry");


    // =========================
    // SORGULA
    // =========================

    if (searchButton) {

        searchButton.addEventListener("click", async function () {

            const playerId = playerIdInput.value.trim();
            const zoneId = zoneIdInput.value.trim();

            error.classList.remove("show");
            result.classList.remove("show");


            // =========================
            // KONTROLLER
            // =========================

            if (!playerId || !zoneId) {

                error.textContent =
                    "Lütfen Oyuncu ID ve Zone ID girin.";

                error.classList.add("show");

                return;
            }


            if (!/^\d+$/.test(playerId)) {

                error.textContent =
                    "Oyuncu ID yalnızca rakamlardan oluşmalıdır.";

                error.classList.add("show");

                return;
            }


            if (!/^\d+$/.test(zoneId)) {

                error.textContent =
                    "Zone ID yalnızca rakamlardan oluşmalıdır.";

                error.classList.add("show");

                return;
            }


            // =========================
            // BUTON
            // =========================

            searchButton.disabled = true;

            searchButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Sorgulanıyor...';


            try {

                // =================================================
                // DOĞRUDAN MLBB API
                // =================================================

                const apiUrl =
                    `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(playerId)}&server=${encodeURIComponent(zoneId)}&decode=false`;

                console.log("MLBB API:", apiUrl);


                const response =
                    await fetch(apiUrl);


                console.log(
                    "MLBB HTTP DURUMU:",
                    response.status
                );


                // =========================
                // JSON CEVABI
                // =========================

                const data =
                    await response.json();


                console.log(
                    "MLBB API CEVABI:",
                    data
                );


                // =========================
                // BAŞARISIZ
                // =========================

                if (!response.ok || !data.success) {

                    throw new Error(
                        data.message ||
                        "Bu ID ve Zone ID ile oyuncu bulunamadı."
                    );
                }


                // =========================
                // OYUNCU ADI
                // =========================

                resultValue.textContent =
                    data.name || "Bilinmiyor";


                // =========================
                // AÇIKLAMA
                // =========================

                resultText.textContent =
                    "";


                // =========================
                // ID
                // =========================

                resultPlayerId.textContent =
                    data.id || playerId;


                // =========================
                // ZONE
                // =========================

                resultZoneId.textContent =
                    data.server || zoneId;

                    resultCountry.textContent =
                    data.country || "Bilinmiyor";


                // =========================
                // SONUCU GÖSTER
                // =========================

                result.classList.add("show");

            }


            // =========================
            // HATA
            // =========================

            catch (err) {

                console.error(
                    "MLBB ID Checker HATASI:",
                    err
                );

                error.textContent =
                    err.message ||
                    "Oyuncu bilgileri alınamadı.";

                error.classList.add("show");

            }


            // =========================
            // BUTONU GERİ GETİR
            // =========================

            finally {

                searchButton.disabled = false;

                searchButton.innerHTML =
                    '<i class="fa-solid fa-magnifying-glass"></i> Oyuncuyu Sorgula';

            }

        });

    }


    // =========================
    // ENTER
    // =========================

    if (playerIdInput && zoneIdInput) {

        zoneIdInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    searchButton.click();

                }

            }
        );

    }


    // =========================
    // TEMİZLE
    // =========================

    if (clearButton) {

        clearButton.addEventListener("click", function () {

            playerIdInput.value = "";
            zoneIdInput.value = "";

            error.classList.remove("show");
            result.classList.remove("show");

            resultValue.textContent = "-";

            resultText.textContent =
                "";

            resultPlayerId.textContent = "-";
            resultZoneId.textContent = "-";

            playerIdInput.focus();

        });

    }

});