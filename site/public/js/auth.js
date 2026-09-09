import { auth, db } from "./firebase.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "firebase/auth";

import {
    collection,
    query,
    where,
    getDocs,
    doc,
    setDoc
} from "firebase/firestore";

document.addEventListener("DOMContentLoaded", () => {

    // Şifre göster / gizle
    const toggleButtons = document.querySelectorAll(".password-toggle");

    toggleButtons.forEach(button => {

        button.addEventListener("click", () => {

            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);

            if (!input) return;

            input.type = input.type === "password"
                ? "text"
                : "password";
        });

    });


    // =========================
    // KAYIT OL
    // =========================

    const registerForm = document.querySelector('form[action="/register"]');

    if (registerForm) {

        registerForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const username = document
                .getElementById("username")
                .value
                .trim();

            const email = document
                .getElementById("email")
                .value
                .trim();

            const password = document
                .getElementById("password")
                .value;

            const passwordConfirm = document
                .getElementById("passwordConfirm")
                .value;

            if (password !== passwordConfirm) {
                alert("Şifreler aynı değil.");
                return;
            }

            if (password.length < 6) {
                alert("Şifre en az 6 karakter olmalı.");
                return;
            }

            try {

                // Kullanıcı adı daha önce alınmış mı?
                const usernameQuery = query(
                    collection(db, "users"),
                    where("username", "==", username)
                );

                const usernameSnapshot = await getDocs(usernameQuery);

                if (!usernameSnapshot.empty) {
                    alert("Bu kullanıcı adı zaten alınmış.");
                    return;
                }

                // Firebase hesabını oluştur
                const userCredential =
                    await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );

                const user = userCredential.user;

                // Kullanıcı bilgilerini Firestore'a kaydet
                await setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: email,
                    createdAt: new Date()
                });

                alert("Hesabın başarıyla oluşturuldu!");

                window.location.href = "/";

            } catch (error) {

                console.error(error);

                if (error.code === "auth/email-already-in-use") {
                    alert("Bu e-posta adresi zaten kayıtlı.");
                } else if (error.code === "auth/invalid-email") {
                    alert("Geçersiz e-posta adresi.");
                } else if (error.code === "auth/weak-password") {
                    alert("Şifre çok zayıf.");
                } else {
                    alert("Kayıt sırasında bir hata oluştu.");
                }

            }

        });

    }


    // =========================
    // GİRİŞ YAP
    // =========================

    const loginForm = document.querySelector('form[action="/login"]');

    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const username = document
                .getElementById("username")
                .value
                .trim();

            const password = document
                .getElementById("password")
                .value;

            try {

                // Kullanıcı adına göre kullanıcıyı bul
                const usernameQuery = query(
                    collection(db, "users"),
                    where("username", "==", username)
                );

                const usernameSnapshot = await getDocs(usernameQuery);

                if (usernameSnapshot.empty) {
                    alert("Kullanıcı adı veya şifre yanlış.");
                    return;
                }

                const userData = usernameSnapshot.docs[0].data();

                // Firebase ile giriş yap
                await signInWithEmailAndPassword(
                    auth,
                    userData.email,
                    password
                );

                alert("Giriş başarılı!");

                window.location.href = "/";

            } catch (error) {

                console.error(error);

                if (
                    error.code === "auth/invalid-credential" ||
                    error.code === "auth/wrong-password"
                ) {
                    alert("Kullanıcı adı veya şifre yanlış.");
                } else {
                    alert("Giriş sırasında bir hata oluştu.");
                }

            }

        });

    }


    // =========================
    // ŞİFREMİ UNUTTUM
    // =========================

    const forgotButton = document.querySelector(".forgot");

    if (forgotButton) {

        forgotButton.addEventListener("click", async (e) => {

            e.preventDefault();

            const email = prompt(
                "Şifre sıfırlama bağlantısını göndereceğimiz e-posta adresini yaz:"
            );

            if (!email) return;

            try {

                await sendPasswordResetEmail(auth, email);

                alert(
                    "Şifre sıfırlama bağlantısı e-posta adresine gönderildi."
                );

            } catch (error) {

                console.error(error);

                alert(
                    "Bu e-posta adresiyle kayıtlı bir hesap bulunamadı veya bir hata oluştu."
                );

            }

        });

    }

});