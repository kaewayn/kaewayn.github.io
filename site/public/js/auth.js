import { auth, db } from "./firebase.js";


import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // ŞİFRE GÖSTER / GİZLE
    // =========================

    document.querySelectorAll(".password-toggle").forEach(button => {

        button.addEventListener("click", () => {

            const input = document.getElementById(
                button.dataset.target
            );

            if (!input) return;

            input.type =
                input.type === "password"
                    ? "text"
                    : "password";

        });

    });


    // =========================
    // REGISTER
    // =========================

    const registerForm =
        document.querySelector('form[action="/register"]');

    if (registerForm) {

        registerForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("password").value;

            const passwordConfirm =
                document.getElementById("passwordConfirm").value;


            if (password !== passwordConfirm) {
                showToast("Şifreler aynı değil.", "error");
                return;
            }

            if (password.length < 6) {
                showToast("Şifre en az 6 karakter olmalı.", "error");
                return;
            }


            try {

                const usernameQuery = query(
                    collection(db, "users"),
                    where("username", "==", username)
                );

                const usernameSnapshot =
                    await getDocs(usernameQuery);

                if (!usernameSnapshot.empty) {
                    alert("Bu kullanıcı adı zaten alınmış.");
                    return;
                }


                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user = userCredential.user;


                await setDoc(
                    doc(db, "users", user.uid),
                    {
                        username: username,
                        email: email,
                        createdAt: new Date()
                    }
                );


                showToast(
                    "Hesabın başarıyla oluşturuldu!",
                    "success"
                );


                setTimeout(() => {
                    window.location.href = "/login";
                }, 1500);


            } catch (error) {

                console.error("REGISTER ERROR:", error);

                if (error.code === "auth/email-already-in-use") {
                    showToast(
                        "Bu e-posta adresi zaten kayıtlı.",
                        "error"
                    );
                }
                else if (error.code === "auth/invalid-email") {
                    showToast(
                        "Geçersiz e-posta adresi.",
                        "error"
                    );
                }
                else if (error.code === "auth/weak-password") {
                    showToast(
                        "Şifre en az 6 karakter olmalı.",
                        "error"
                    );
                }
                else {
                    showToast(
                        "Kayıt sırasında hata oluştu: " +
                        error.message,
                        "error"
                    );
                }

            }

        });

    }


    // =========================
    // LOGIN
    // =========================

    const loginForm =
        document.querySelector('form[action="/login"]');

    if (loginForm) {

        loginForm.addEventListener("submit", async (event) => {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value;


            try {

                const usernameQuery = query(
                    collection(db, "users"),
                    where("username", "==", username)
                );

                const usernameSnapshot =
                    await getDocs(usernameQuery);


                if (usernameSnapshot.empty) {
                    showToast(
                        "Kullanıcı adı veya şifre yanlış.",
                        "error"
                    );
                    return;
                }


                const userData =
                    usernameSnapshot.docs[0].data();


                await signInWithEmailAndPassword(
                    auth,
                    userData.email,
                    password
                );


                localStorage.setItem(
                    "username",
                    userData.username
                );


                showToast(
                    "Giriş başarılı!",
                    "success"
                );


                setTimeout(() => {
                    window.location.href = "/";
                }, 1500);


            } catch (error) {

                console.error("LOGIN ERROR:", error);

                if (
                    error.code === "auth/invalid-credential" ||
                    error.code === "auth/wrong-password"
                ) {
                    alert("Kullanıcı adı veya şifre yanlış.");
                }
                else {
                    alert(
                        "Giriş sırasında hata oluştu: " +
                        error.message
                    );
                }

            }

        });

    }


    // =========================
    // ŞİFREMİ UNUTTUM
    // =========================

    const forgotButton =
        document.querySelector(".forgot");

    if (forgotButton) {

        forgotButton.addEventListener("click", (event) => {

            event.preventDefault();

            const modal =
                document.getElementById("reset-modal");

            const emailInput =
                document.getElementById("reset-email");

            const sendButton =
                document.getElementById("reset-send");

            const cancelButton =
                document.getElementById("reset-cancel");


            if (
                !modal ||
                !emailInput ||
                !sendButton ||
                !cancelButton
            ) {
                console.error(
                    "Şifre sıfırlama penceresi bulunamadı."
                );
                return;
            }


            modal.classList.add("show");

            emailInput.value = "";
            emailInput.focus();


            cancelButton.onclick = () => {
                modal.classList.remove("show");
            };


            sendButton.onclick = async () => {

                const email =
                    emailInput.value.trim();


                if (!email) {
                    showToast(
                        "E-posta adresini gir.",
                        "error"
                    );
                    return;
                }


                try {

                    await sendPasswordResetEmail(
                        auth,
                        email
                    );

                    modal.classList.remove("show");

                    showToast(
                        "Şifre sıfırlama bağlantısı gönderildi.",
                        "success"
                    );


                } catch (error) {

                    console.error(
                        "RESET ERROR:",
                        error
                    );

                    showToast(
                        "Şifre sıfırlama işlemi başarısız oldu.",
                        "error"
                    );

                }

            };

        });

    }


    // =========================
    // HESAP DURUMU
    // =========================

    const loginMenu =
        document.getElementById("loginMenu");

    const logoutMenu =
        document.getElementById("logoutMenu");


onAuthStateChanged(auth, (user) => {

    console.log("FIREBASE KULLANICI:", user);

    if (!loginMenu || !logoutMenu) {
        console.log("MENÜLER BULUNAMADI");
        return;
    }

    if (user) {
        loginMenu.style.display = "none";
        logoutMenu.style.display = "block";

        console.log("GİRİŞ YAPILMIŞ → ÇIKIŞ YAP");
    } else {
        loginMenu.style.display = "block";
        logoutMenu.style.display = "none";

        console.log("GİRİŞ YAPILMAMIŞ → GİRİŞ YAP");
    }

});


    // =========================
    // ÇIKIŞ YAP
    // =========================

    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener("click", async (event) => {

            event.preventDefault();

            try {

                await signOut(auth);

                localStorage.removeItem("username");

                window.location.href = "/";

            } catch (error) {

                console.error(
                    "LOGOUT ERROR:",
                    error
                );

                showToast(
                    "Çıkış yapılırken bir hata oluştu.",
                    "error"
                );

            }

        });

    }

});