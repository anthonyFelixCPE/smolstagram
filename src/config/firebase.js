import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDNEseHnM9t3r_X6kX3jOnsKxXyPc_pPec",
    authDomain: "smolstagram-f51d0.firebaseapp.com",
    projectId: "smolstagram-f51d0",
    storageBucket: "smolstagram-f51d0.firebasestorage.app",
    messagingSenderId: "188857044929",
    appId: "1:188857044929:web:fb10a12be070a0d1772940",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
