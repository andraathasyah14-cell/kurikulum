
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth, onError?: (error: any) => void): void {
  const provider = new GoogleAuthProvider();
  // CRITICAL: Call signInWithPopup directly. Do NOT use 'await'.
  signInWithPopup(authInstance, provider).catch((error) => {
    console.error("Gagal login dengan Google:", error);
    if (onError) onError(error);
  });
}

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
