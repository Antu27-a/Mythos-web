import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAvDDvRa2Lp2s_mhDOJktPVbcXgc2yovnc",
  authDomain: "mythos-9d2e4.firebaseapp.com",
  projectId: "mythos-9d2e4",
  storageBucket: "mythos-9d2e4.firebasestorage.app",
  messagingSenderId: "112311901139",
  appId: "1:112311901139:web:373dfe27fc18f053836d26"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Establecer persistencia en localStorage
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Firebase manejará la sesión con persistencia
    console.log('Persistencia de sesión establecida');
  })
  .catch((error) => {
    console.error("Error al establecer persistencia:", error);
  });

// Exportar servicios

export const db = getFirestore(app);
