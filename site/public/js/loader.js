
/* KAE WAYN — SHARED LOADER */

(() => {
    "use strict";

    // /kae kendi açılış animasyonunu kullanır.
    if (document.getElementById("kaeLoader")) return;

    const messages = [
        "Kişisel alan hazırlanıyor",
        "Görsel sistem başlatılıyor",
        "Hoş geldin, Kae Wayn"
    ];

    let loader = null;
    let messageTimer = null;
    let hideTimer = null;
    let removeTimer = null;
    let messageIndex = 0;
    let finished = false;

    const LOADER_DURATION = 2400;
    const FADE_DURATION = 800;

    function createLoader() {
        const element = document.createElement("div");

        element.className = "site-loader";
        element.id = "siteLoader";
        element.setAttribute("aria-hidden", "true");

        element.innerHTML = `
            <div class="site-loader-mark">
                <img src="/img/logo.png" alt="">
            </div>

            <div class="site-loader-title">KAE WAYN</div>

            <div class="site-loader-status">
                <span class="site-loader-dot"></span>
                <span class="site-loader-message">
                    ${messages[0]}
                </span>
            </div>

            <div class="site-loader-track">
                <span class="site-loader-progress"></span>
            </div>

            <span class="site-loader-index">KW / 001</span>
        `;

        return element;
    }

    function showLoader() {
        if (document.getElementById("kaeLoader")) return;

        clearTimeout(hideTimer);
        clearTimeout(removeTimer);
        clearInterval(messageTimer);

        finished = false;
        messageIndex = 0;

        document.getElementById("siteLoader")?.remove();

        loader = createLoader();
        document.body.appendChild(loader);

        const message = loader.querySelector(".site-loader-message");

        messageTimer = window.setInterval(() => {
            if (!message || !loader?.isConnected) return;

            messageIndex++;

            if (messageIndex >= messages.length) {
                clearInterval(messageTimer);
                return;
            }

            message.textContent = messages[messageIndex];

            message.style.animation = "none";
            void message.offsetWidth;
            message.style.animation = "";
        }, 800);
    }

    function hideLoader() {
        if (finished || !loader) return;

        finished = true;

        clearInterval(messageTimer);
        loader.classList.add("is-hidden");

        document.documentElement.classList.remove("site-loading");

        removeTimer = window.setTimeout(() => {
            loader?.remove();
            loader = null;
        }, FADE_DURATION);
    }

    function startLoader() {
        showLoader();

        if (!loader) return;

        document.documentElement.classList.add("site-loading");

        hideTimer = window.setTimeout(
            hideLoader,
            LOADER_DURATION
        );

        window.addEventListener("load", () => {
            // Sayfa yüklenmeden önceki zamanlayıcıyı sıfırlama;
            // loader'ın toplam süresi tutarlı kalsın.
            if (!finished && !hideTimer) {
                hideTimer = window.setTimeout(
                    hideLoader,
                    LOADER_DURATION
                );
            }
        }, { once: true });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", startLoader, {
            once: true
        });
    } else {
        startLoader();
    }

    // Sayfalar arası geçiş
    document.addEventListener("click", (event) => {
        const target = event.target;

        if (!(target instanceof Element)) return;

        const link = target.closest("a");

        if (!link || event.defaultPrevented) return;
        if (event.button !== 0) return;

        if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) return;

        if (link.target && link.target !== "_self") return;
        if (link.hasAttribute("download")) return;
        if (link.hasAttribute("data-no-loader")) return;

        const href = link.getAttribute("href");

        if (
            !href ||
            href.startsWith("#") ||
            href.startsWith("javascript:")
        ) return;

        let destination;

        try {
            destination = new URL(href, window.location.href);
        } catch {
            return;
        }

        if (destination.origin !== window.location.origin) return;
        if (document.getElementById("kaeLoader")) return;

        const current = new URL(window.location.href);

        if (
            destination.pathname === current.pathname &&
            destination.search === current.search
        ) return;

        event.preventDefault();

        showLoader();

        window.setTimeout(() => {
            window.location.href = destination.href;
        }, 350);
    });
})();
