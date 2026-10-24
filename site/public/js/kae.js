
/* =========================================================
   KAE WAYN — PERSONAL PAGE JS
   Tek rol animasyonu, PC + mobil uyumlu efektler
   ========================================================= */

(() => {
    "use strict";

    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, {
                once: true
            });
        } else {
            callback();
        }
    };

    ready(() => {
        const $ = (selector, parent = document) =>
            parent.querySelector(selector);

        const $$ = (selector, parent = document) =>
            Array.from(parent.querySelectorAll(selector));

        /* =====================================================
           1. AÇILIŞ EKRANI
           ===================================================== */

        const loader = $("#kaeLoader");
        const loaderText = $("#kaeLoaderText");

        if (loader) {
            document.body.classList.add("kae-loading");

            const messages = [
                "Kişisel alan hazırlanıyor",
                "Görsel sistem başlatılıyor",
                "Hoş geldin, Kae Wayn"
            ];

            let messageIndex = 0;
            let loaderFinished = false;

            const messageTimer = window.setInterval(() => {
                messageIndex++;

                if (messageIndex < messages.length && loaderText) {
                    loaderText.textContent = messages[messageIndex];
                } else {
                    window.clearInterval(messageTimer);
                }
            }, 850);

            const hideLoader = () => {
                if (loaderFinished) return;
                loaderFinished = true;

                window.clearInterval(messageTimer);
                loader.classList.add("is-hidden");
                document.body.classList.remove("kae-loading");

                window.setTimeout(() => {
                    if (loader.isConnected) {
                        loader.remove();
                    }
                }, 900);
            };

            window.setTimeout(hideLoader, 2500);

            // Sayfa yüklemesi uzarsa yükleyicinin takılı kalmasını önle.
            window.addEventListener("load", () => {
                window.setTimeout(hideLoader, 2500);
            }, { once: true });
        }

        document.documentElement.classList.add("kae-js-ready");

        /* =====================================================
           2. HERO ROL YAZISI
           Yalnızca tek zamanlayıcı kullanılır.
           ===================================================== */

        const roleElement = $("#kaeRoleText");

        if (roleElement) {
            const roles = [
                "Digital Creator",
                "Technology Enthusiast",
                "Web Developer",
                "Gaming & Design",
                "Kae Wayn"
            ];

            let roleIndex = 0;
            let charIndex = roles[0].length;
            let deleting = true;
            let roleTimer = null;
            let pauseUntil = Date.now() + 1400;

            roleElement.textContent = roles[0];

            const typeRole = () => {
                if (!roleElement.isConnected) return;

                const currentRole = roles[roleIndex];

                if (Date.now() < pauseUntil) {
                    roleTimer = window.setTimeout(typeRole, 100);
                    return;
                }

                if (deleting) {
                    charIndex--;
                } else {
                    charIndex++;
                }

                roleElement.textContent =
                    currentRole.slice(0, Math.max(0, charIndex));

                let delay = deleting ? 38 : 65;

                if (deleting && charIndex <= 0) {
                    deleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                    charIndex = 0;
                    delay = 280;
                } else if (
                    !deleting &&
                    charIndex >= roles[roleIndex].length
                ) {
                    charIndex = roles[roleIndex].length;
                    deleting = true;
                    pauseUntil = Date.now() + 1500;
                    delay = 100;
                }

                roleTimer = window.setTimeout(typeRole, delay);
            };

            roleTimer = window.setTimeout(() => {
                roleIndex = 1;
                charIndex = 0;
                deleting = false;
                typeRole();
            }, 1700);
        }

        /* =====================================================
           3. PROFİL KARTINDA DÖNÜŞEN METİN
           ===================================================== */

        const rotatingText = $("#kaeRotatingText");

        if (rotatingText) {
            const messages = [
                "Kendi yolumda.",
                "Her zaman gelişim.",
                "Farklı düşün, üret.",
                "Yarışmayan bir insanı yenemezsin."
            ];

            let messageIndex = 0;

            window.setInterval(() => {
                if (!rotatingText.isConnected) return;

                rotatingText.classList.add("is-changing");

                window.setTimeout(() => {
                    if (!rotatingText.isConnected) return;

                    messageIndex = (messageIndex + 1) % messages.length;
                    rotatingText.textContent = messages[messageIndex];
                    rotatingText.classList.remove("is-changing");
                }, 260);
            }, 4000);
        }

        /* =====================================================
           4. SCROLL REVEAL
           ===================================================== */

        const revealElements = $$(".kae-reveal");

        if ("IntersectionObserver" in window) {
            const revealObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("is-visible");
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.1,
                    rootMargin: "0px 0px -30px 0px"
                }
            );

            revealElements.forEach((element) => {
                revealObserver.observe(element);
            });
        } else {
            revealElements.forEach((element) => {
                element.classList.add("is-visible");
            });
        }

        /* =====================================================
           5. PARÇACIK ARKA PLANI
           ===================================================== */

        const canvas = $("#kaeParticles");
        const context = canvas?.getContext("2d");

        if (canvas && context) {
            let width = 0;
            let height = 0;
            let particles = [];
            let animationFrame = 0;
            let lastFrame = 0;

            const particleCount = () => {
                const areaCount = Math.floor(
                    (width * height) / 22000
                );

                // Mobilde daha az parçacık, PC'de daha yoğun arka plan.
                return Math.min(
                    65,
                    Math.max(18, areaCount)
                );
            };

            const resizeCanvas = () => {
                const pixelRatio = Math.min(
                    window.devicePixelRatio || 1,
                    2
                );

                width = window.innerWidth;
                height = window.innerHeight;

                canvas.width = Math.floor(width * pixelRatio);
                canvas.height = Math.floor(height * pixelRatio);
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                context.setTransform(
                    pixelRatio,
                    0,
                    0,
                    pixelRatio,
                    0,
                    0
                );

                particles = Array.from(
                    { length: particleCount() },
                    () => ({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius: Math.random() * 1.25 + 0.35,
                        vx: (Math.random() - 0.5) * 0.24,
                        vy: (Math.random() - 0.5) * 0.24,
                        alpha: Math.random() * 0.35 + 0.12
                    })
                );
            };

            const drawParticles = (timestamp) => {
                animationFrame = 0;

                if (document.hidden) return;

                // Yaklaşık 30 FPS ile performansı dengeler.
                if (timestamp - lastFrame >= 32) {
                    lastFrame = timestamp;

                    context.clearRect(0, 0, width, height);

                    particles.forEach((particle, index) => {
                        particle.x += particle.vx;
                        particle.y += particle.vy;

                        if (particle.x < -5) particle.x = width + 5;
                        if (particle.x > width + 5) particle.x = -5;
                        if (particle.y < -5) particle.y = height + 5;
                        if (particle.y > height + 5) particle.y = -5;

                        context.beginPath();
                        context.arc(
                            particle.x,
                            particle.y,
                            particle.radius,
                            0,
                            Math.PI * 2
                        );

                        context.fillStyle =
                            `rgba(235,235,235,${particle.alpha})`;

                        context.fill();

                        for (
                            let nextIndex = index + 1;
                            nextIndex < particles.length;
                            nextIndex++
                        ) {
                            const other = particles[nextIndex];
                            const dx = particle.x - other.x;
                            const dy = particle.y - other.y;
                            const distance = Math.sqrt(
                                dx * dx + dy * dy
                            );

                            if (distance < 105) {
                                const opacity =
                                    (1 - distance / 105) * 0.075;

                                context.beginPath();
                                context.moveTo(particle.x, particle.y);
                                context.lineTo(other.x, other.y);

                                context.strokeStyle =
                                    `rgba(255,255,255,${opacity})`;

                                context.lineWidth = 0.6;
                                context.stroke();
                            }
                        }
                    });
                }

                animationFrame =
                    window.requestAnimationFrame(drawParticles);
            };

            const startParticles = () => {
                if (document.hidden || animationFrame) return;

                animationFrame =
                    window.requestAnimationFrame(drawParticles);
            };

            const stopParticles = () => {
                if (animationFrame) {
                    window.cancelAnimationFrame(animationFrame);
                    animationFrame = 0;
                }
            };

            resizeCanvas();
            startParticles();

            window.addEventListener("resize", () => {
                resizeCanvas();
            }, { passive: true });

            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    stopParticles();
                } else {
                    lastFrame = 0;
                    startParticles();
                }
            });
        }

        /* =====================================================
           6. GERİ YUKARI ÇIK BUTONU
           ===================================================== */

        const backTop = $("#kaeBackTop");

        if (backTop) {
            const updateBackTop = () => {
                backTop.classList.toggle(
                    "is-visible",
                    window.scrollY > 450
                );
            };

            window.addEventListener("scroll", updateBackTop, {
                passive: true
            });

            updateBackTop();

            backTop.addEventListener("click", (event) => {
                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            });
        }

        /* =====================================================
           7. PROFİL KARTI MOUSE EFEKTİ
           Doğru sınıf: .kae-profile-card
           ===================================================== */

        const profileCard = $(".kae-profile-card");

        if (
            profileCard &&
            window.matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
            profileCard.addEventListener("pointermove", (event) => {
                const rect = profileCard.getBoundingClientRect();

                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;

                profileCard.style.setProperty(
                    "--kae-mouse-x",
                    `${event.clientX - rect.left}px`
                );

                profileCard.style.setProperty(
                    "--kae-mouse-y",
                    `${event.clientY - rect.top}px`
                );

                profileCard.style.transform =
                    `perspective(1100px) ` +
                    `rotateX(${(0.5 - y) * 4}deg) ` +
                    `rotateY(${(x - 0.5) * 4}deg)`;
            });

            profileCard.addEventListener("pointerleave", () => {
                profileCard.style.transform = "";
                profileCard.style.setProperty("--kae-mouse-x", "50%");
                profileCard.style.setProperty("--kae-mouse-y", "35%");
            });
        }

        /* =====================================================
           8. HERO İSİM TARAMASI İÇİN DURUM
           ===================================================== */

        const nameScan = $(".kae-name-scan");

        if (nameScan) {
            nameScan.style.display = "block";
        }

        /* =====================================================
           9. HATA AYIKLAMA İÇİN HAZIR DURUM
           ===================================================== */

        document.documentElement.classList.add("kae-ready");
    });
})();
