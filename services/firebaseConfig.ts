import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "fake-placeholder-ok-for-class",
  authDomain: "connected-services-app.firebaseapp.com",
  projectId: "connected-services-app",
  appId: "1:1234567890:web:abc123",
};
// Start App --- lainch
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// -- AUth State ----
export function authListen(cb: (uid: string | null) => void) {
  return onAuthStateChanged(auth, (u) => cb(u ? u.uid : null));
}

// --- Mananeg SIgnout Auth -- Bonjourr!---
export async function signInAnon() {
  await signInAnonymously(auth);
}

// --- Sigout Auth ---byeee!!
export async function signOutUser() {
  await signOut(auth);
}
