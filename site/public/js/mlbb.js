document.addEventListener("DOMContentLoaded", function () {

    const menuButton = document.getElementById("menuButton");
    const sideMenu = document.getElementById("side-menu");
    const menuOverlay = document.getElementById("menu-overlay");
    const menuClose = document.getElementById("menu-close");

    // NAVBAR MENÜ
    if (menuButton && sideMenu && menuOverlay) {

        menuButton.addEventListener("click", function () {
            sideMenu.classList.add("active");
            menuOverlay.classList.add("active");
        });

        menuOverlay.addEventListener("click", function () {
            sideMenu.classList.remove("active");
            menuOverlay.classList.remove("active");
        });

        if (menuClose) {
            menuClose.addEventListener("click", function () {
                sideMenu.classList.remove("active");
                menuOverlay.classList.remove("active");
            });
        }
    }

});