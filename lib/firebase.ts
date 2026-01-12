
import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrMyJI_0C2zf4-0UATh7QjEfFiBFzGTPY",
  authDomain: "crml-449dc.firebaseapp.com",
  projectId: "crml-449dc",
  storageBucket: "crml-449dc.firebasestorage.app",
  messagingSenderId: "974324326448",
  appId: "1:974324326448:web:afd04695e6a1d57887cdf5"
};

// Détection si la config est toujours celle par défaut
export const isFirebaseConfigured = firebaseConfig.projectId !== "votre-projet";

let app;
let dbInstance: Firestore | null = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        dbInstance = getFirestore(app);
    } catch (error) {
        console.error("Erreur d'initialisation Firebase:", error);
    }
} else {
    console.warn("⚠️ Firebase non configuré (Mode Démo Local actif). Veuillez mettre à jour lib/firebase.ts pour le temps réel.");
}

// Export de la base de données (peut être null si non configuré)
export const db = dbInstance;
