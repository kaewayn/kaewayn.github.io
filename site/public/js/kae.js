
/* =========================================================
   KAE WAYN — PERSONAL PAGE JS
   ========================================================= */

(() => {
    "use strict";

    const ready = (callback) => {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback, { once: true });
        } else {
            callback();
        }
    };

    ready(() => {
        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        /* -----------------------------------------
           1. AÇILIŞ EKRANI
        ----------------------------------------- */

        const loader = document.getElementById("kaeLoader");
        const loaderText = document.getElementById("kaeLoaderText");

        if (loader) {
            document.body.classList.add("kae-loading");

            const loaderMessages = [
                "Kişisel alan hazırlanıyor",
                "Görsel sistem başlatılıyor",
                "Hoş geldin, Kae Wayn"
            ];

            let messageIndex = 0;

            const messageInterval = window.setInterval(() => {
                messageIndex += 1;

                if (messageIndex < loaderMessages.length && loaderText) {
                    loaderText.textContent = loaderMessages[messageIndex];
                }
            }, 850);

            const hideLoader = () => {
                window.clearInterval(messageInterval);
                loader.classList.add("is-hidden");
                document.body.classList.remove("kae-loading");

                window.setTimeout(() => {
                    loader.remove();
                }, 900);
            };

            if (reduceMotion) {
                hideLoader();
            } else {
                window.setTimeout(hideLoader, 2900);
            }
        }

        /* -----------------------------------------
           2. YAZI YAZMA EFEKTİ
        ----------------------------------------- */

        const roleElement = document.getElementById("kaeRoleText");

        if (roleElement) {
            const roles = [
                "Digital Creator",
                "Technology Enthusiast",
                "Web Developer",
                "Gaming & Design",
                "Kae Wayn"
            ];

            if (reduceMotion) {
                roleElement.textContent = roles[0];
            } else {
                let roleIndex = 0;
                let charIndex = roles[0].length;
                let deleting = true;
                let pauseUntil = Date.now() + 1100;

                const typeRole = () => {
                    const currentRole = roles[roleIndex];

                    if (Date.now() < pauseUntil) {
                        window.setTimeout(typeRole, 100);
                        return;
                    }

                    if (deleting) {
                        charIndex -= 1;
                    } else {
                        charIndex += 1;
                    }

                    roleElement.textContent = currentRole.slice(0, charIndex);

                    let delay = deleting ? 34 : 62;

                    if (deleting && charIndex <= 0) {
                        deleting = false;
                        roleIndex = (roleIndex + 1) % roles.length;
                        delay = 260;
                    } else if (!deleting && charIndex >= roles[roleIndex].length) {
                        deleting = true;
                        pauseUntil = Date.now() + 1200;
                        delay = 100;
                    }

                    window.setTimeout(typeRole, delay);
                };

                window.setTimeout(() => {
                    roleIndex = 1;
                    charIndex = 0;
                    deleting = false;
                    typeRole();
                }, 1800);
            }
        }

        /* -----------------------------------------
           3. PROFİL KARTINDA DÖNÜŞEN METİN
        ----------------------------------------- */

        const rotatingText = document.getElementById("kaeRotatingText");

        if (rotatingText && !reduceMotion) {
            const profileMessages = [
                "Kendi yolumda.",
                "Her zaman gelişim.",
                "Farklı düşün, üret.",
                "Yarışmayan bir insanı yenemezsin."
            ];

            let profileIndex = 0;

            window.setInterval(() => {
                rotatingText.classList.add("is-changing");

                window.setTimeout(() => {
                    profileIndex = (profileIndex + 1) % profileMessages.length;
                    rotatingText.textContent = profileMessages[profileIndex];
                    rotatingText.classList.remove("is-changing");
                }, 260);
            }, 4000);
        }

        /* -----------------------------------------
           4. SCROLL REVEAL
        ----------------------------------------- */

        const revealElements = document.querySelectorAll(".kae-reveal");

        if (reduceMotion || !("IntersectionObserver" in window)) {
            revealElements.forEach((element) => {
                element.classList.add("is-visible");
            });
        } else {
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
                    threshold: 0.12,
                    rootMargin: "0px 0px -35px 0px"
                }
            );

            revealElements.forEach((element) => {
                revealObserver.observe(element);
            });
        }

        /* -----------------------------------------
           5. HAFİF PARTİKÜL ARKA PLANI
        ----------------------------------------- */

        const canvas = document.getElementById("kaeParticles");
        const context = canvas?.getContext("2d");

        if (canvas && context && !reduceMotion) {
            let width = 0;
            let height = 0;
            let particles = [];
            let animationFrame = 0;
            let lastFrame = 0;

            const particleCount = () => {
                return Math.min(
                    65,
                    Math.max(20, Math.floor((width * height) / 22000))
                );
            };

            const resizeCanvas = () => {
                const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

                width = window.innerWidth;
                height = window.innerHeight;

                canvas.width = Math.floor(width * pixelRatio);
                canvas.height = Math.floor(height * pixelRatio);
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

                particles = Array.from(
                    { length: particleCount() },
                    () => ({
                        x: Math.random() * width,
                        y: Math.random() * height,
                        radius: Math.random() * 1.3 + 0.3,
                        vx: (Math.random() - 0.5) * 0.22,
                        vy: (Math.random() - 0.5) * 0.22,
                        alpha: Math.random() * 0.36 + 0.12
                    })
                );
            };

            const drawParticles = (timestamp) => {
                if (document.hidden) {
                    animationFrame = 0;
                    return;
                }

                // Gereksiz yüksek FPS yükünü sınırlar.
                if (timestamp - lastFrame < 32) {
                    animationFrame = window.requestAnimationFrame(drawParticles);
                    return;
                }

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
                    context.fillStyle = `rgba(235,235,235,${particle.alpha})`;
                    context.fill();

                    // Yakın parçacıklar arasında çok ince çizgiler.
                    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex++) {
                        const other = particles[nextIndex];
                        const dx = particle.x - other.x;
                        const dy = particle.y - other.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < 105) {
                            const opacity = (1 - distance / 105) * 0.075;

                            context.beginPath();
                            context.moveTo(particle.x, particle.y);
                            context.lineTo(other.x, other.y);
                            context.strokeStyle = `rgba(255,255,255,${opacity})`;
                            context.lineWidth = 0.6;
                            context.stroke();
                        }
                    }
                });

                animationFrame = window.requestAnimationFrame(drawParticles);
            };

            const startParticles = () => {
                if (!document.hidden && !animationFrame) {
                    animationFrame = window.requestAnimationFrame(drawParticles);
                }
            };

            const stopParticles = () => {
                if (animationFrame) {
                    window.cancelAnimationFrame(animationFrame);
                    animationFrame = 0;
                }
            };

            resizeCanvas();
            startParticles();

            window.addEventListener("resize", resizeCanvas, { passive: true });

            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    stopParticles();
                } else {
                    lastFrame = 0;
                    startParticles();
                }
            });
        }

        /* -----------------------------------------
           6. BAŞA DÖN
        ----------------------------------------- */

        const backTop = document.getElementById("kaeBackTop");

        if (backTop) {
            backTop.addEventListener("click", (event) => {
                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: reduceMotion ? "auto" : "smooth"
                });
            });
        }
    });
})();


(() => {
    const card = document.querySelector(".kae-profile-main");
    if (!card) return;

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        card.style.setProperty(
            "--kae-mouse-x",
            `${event.clientX - rect.left}px`
        );

        card.style.setProperty(
            "--kae-mouse-y",
            `${event.clientY - rect.top}px`
        );

        if (event.pointerType === "mouse") {
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            card.style.transform =
                `perspective(1100px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
        }
    });

    card.addEventListener("pointerleave", () => {
        card.style.transform = "";
        card.style.setProperty("--kae-mouse-x", "50%");
        card.style.setProperty("--kae-mouse-y", "35%");
    });
})();

/* HERO — düzenli rol yazısı değişimi */

(() => {
    const role = document.getElementById("kaeRoleText");
    if (!role) return;

    const roles = [
        "Digital Creator",
        "Technology Enthusiast",
        "Web Developer",
        "Gaming & Design",
        "Kae Wayn"
    ];

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion) return;

    let index = 0;

    role.textContent = roles[index];

    window.setInterval(() => {
        role.style.opacity = "0";
        role.style.transform = "translateY(5px)";

        window.setTimeout(() => {
            index = (index + 1) % roles.length;
            role.textContent = roles[index];
            role.style.transform = "translateY(-5px)";

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    role.style.opacity = "1";
                    role.style.transform = "translateY(0)";
                });
            });
        }, 220);
    }, 3000);
})();
