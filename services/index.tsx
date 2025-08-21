import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

// paste from Firebase Console > Project settings > Your apps > Web config
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  appId: "1:...",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
