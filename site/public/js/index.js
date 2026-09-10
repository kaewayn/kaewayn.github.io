document.addEventListener("DOMContentLoaded", () => {

    const menuButton = document.getElementById("menuButton");
    const sideMenu = document.getElementById("side-menu");
    const menuOverlay = document.getElementById("menu-overlay");
    const menuClose = document.getElementById("menu-close");

        const menuUsername = document.getElementById("menuUsername");
    const menuStatus = document.getElementById("menuStatus");
    const menuAccount = document.querySelector(".menu-account");

    const username = localStorage.getItem("username");

if (username) {
    menuUsername.textContent = username;
    menuStatus.textContent = "Hoş geldin";

    if (menuAccount) {
        menuAccount.style.display = "none";
    }
} else {
    menuUsername.textContent = "Misafir";
    menuStatus.textContent = "Giriş yapmadınız";

    if (menuAccount) {
        menuAccount.style.display = "flex";
    }
}

    if (!menuButton || !sideMenu || !menuOverlay) {
        console.error("Menü elemanları bulunamadı.");
        return;
    }

    // MENÜYÜ AÇ
    menuButton.addEventListener("click", () => {
        sideMenu.classList.add("open");
        menuOverlay.classList.add("show");
    });

    // X İLE KAPAT
    if (menuClose) {
        menuClose.addEventListener("click", () => {
            closeMenu();
        });
    }

    // KARARTMAYA BASINCA KAPAT
    menuOverlay.addEventListener("click", () => {
        closeMenu();
    });

    // MENÜ LİNKLERİNE BASINCA KAPAT
    const menuLinks = sideMenu.querySelectorAll("a");

    menuLinks.forEach((link) => {
        link.addEventListener("click", () => {
            closeMenu();
        });
    });

    // KAPATMA FONKSİYONU
    function closeMenu() {
        sideMenu.classList.remove("open");
        menuOverlay.classList.remove("show");
    }

});