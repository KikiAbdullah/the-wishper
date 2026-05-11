import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getDatabase, ref, set, onValue, get, update, remove, child } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAC-3Can2IPr1Hg38IwtRxv4bB_FsH3ct8",
    authDomain: "becoder-whisper.firebaseapp.com",
    databaseURL: "https://becoder-whisper-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "becoder-whisper",
    storageBucket: "becoder-whisper.firebasestorage.app",
    messagingSenderId: "248634669075",
    appId: "1:248634669075:web:14ad4d4b7904f494e2e7e6",
    measurementId: "G-9MKPPBL720"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export utilities for direct use in our other module files
export { db, ref, set, onValue, get, update, remove, child };
