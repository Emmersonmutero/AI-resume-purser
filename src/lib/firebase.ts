// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8x9A6JELX6_I8JS_DtUM_dg7wFvViVLk",
  authDomain: "sjat-5a48f.firebaseapp.com",
  projectId: "sjat-5a48f",
  storageBucket: "sjat-5a48f.firebasestorage.app",
  messagingSenderId: "96649357814",
  appId: "1:96649357814:web:c7d586e34de8143b2f3fd7",
  measurementId: "G-XP0HL7XGYV"
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: browserLocalPersistence
});

const db = getFirestore(app);

export { app, auth, db };
