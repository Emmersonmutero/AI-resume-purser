// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
