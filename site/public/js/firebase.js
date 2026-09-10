import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6HN9Vci_y5jOKixTxjCH_T0NvgrQmUdU",
    authDomain: "kaewayn0.firebaseapp.com",
    projectId: "kaewayn0",
    storageBucket: "kaewayn0.firebasestorage.app",
    messagingSenderId: "298976064307",
    appId: "1:298976064307:web:ab45d8cba6dc771ba48446",
    measurementId: "G-KPNJH9J108"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);