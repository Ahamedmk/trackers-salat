// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Ce sont des valeurs d'exemple, à remplacer par les vôtres
const firebaseConfig = {
    apiKey: "AIzaSyA8Ist7JzIOA1ZY7JigVTOlQXsZzQ3GdWA",
    authDomain: "trackers-salat.firebaseapp.com",
    databaseURL:"https://trackers-salat-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "trackers-salat",
    storageBucket: "trackers-salat.firebasestorage.app",
    messagingSenderId: "464999708434",
    appId: "1:464999708434:web:34e1eaa8efd60012a0a5cb"
  };

// Initialisation de l'app Firebase
const app = initializeApp(firebaseConfig);

// Initialisation des services dont on a besoin
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { auth, db, storage };
