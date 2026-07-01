"use client";

import { FirebaseError, initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
};

export interface GoogleDoctorIdentity {
  uid: string;
  email: string;
  fullName: string;
  password: string;
}

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.messagingSenderId
  );
}

export function assertFirebaseConfig() {
  if (!hasFirebaseConfig()) {
    throw new Error("Google Sign-In needs Firebase Web config in .env.local.");
  }
}

export async function signInWithGooglePopup(): Promise<GoogleDoctorIdentity> {
  assertFirebaseConfig();
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  try {
    const credential = await signInWithPopup(auth, provider);
    const email = credential.user.email;
    if (!email) throw new Error("Google account did not return an email address.");
    return {
      uid: credential.user.uid,
      email,
      fullName: credential.user.displayName ?? email.split("@")[0] ?? "Doctor",
      password: `GoogleAuth_${credential.user.uid}`
    };
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/popup-closed-by-user") {
      throw new Error("Google sign-in was cancelled.");
    }
    throw error;
  }
}

export async function signOutGoogle() {
  if (!hasFirebaseConfig() || !getApps().length) return;
  await signOut(getAuth(getApps()[0]));
}
