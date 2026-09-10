document.addEventListener("DOMContentLoaded", () => {

    const menuButton = document.getElementById("menuButton");
    const sideMenu = document.getElementById("side-menu");
    const menuOverlay = document.getElementById("menu-overlay");

    if (!menuButton || !sideMenu) {
        console.error("Menü elemanları bulunamadı.");
        return;
    }

    // MENÜYÜ AÇ
    menuButton.addEventListener("click", () => {
        sideMenu.classList.add("active");

        if (menuOverlay) {
            menuOverlay.classList.add("active");
        }
    });

    // OVERLAY'E BASINCA KAPAT
    if (menuOverlay) {
        menuOverlay.addEventListener("click", () => {
            sideMenu.classList.remove("active");
            menuOverlay.classList.remove("active");
        });
    }

    // MENÜDEKİ LİNKLERE BASINCA KAPAT
    const menuLinks = sideMenu.querySelectorAll("a");

    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            sideMenu.classList.remove("active");

            if (menuOverlay) {
                menuOverlay.classList.remove("active");
            }
        });
    });

});