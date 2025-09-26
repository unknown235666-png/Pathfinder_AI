
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  "projectId": "pathfinder-ai-xsk6g",
  "appId": "1:686789703927:web:cd9cfb6ea066e1a52f7bf2",
  "apiKey": "AIzaSyBgLJMNCiBBtCaHZcvJvAJSz81G7R9vDxs",
  "authDomain": "pathfinder-ai-xsk6g.firebaseapp.com",
  "measurementId": "G-L4RVE8S79J",
  "messagingSenderId": "686789703927"
};


// Client-side Firebase app initialization
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Client-side Firestore instance
const db: Firestore = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
