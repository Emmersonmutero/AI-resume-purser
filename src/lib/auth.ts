'use server';

import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { app } from './firebase';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpWithEmail(formData: FormData) {
  const result = emailPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email or password format.' };
  }
  const { email, password } = result.data;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/dashboard');
}

export async function signInWithEmail(formData: FormData) {
  const result = emailPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email or password format.' };
  }
  const { email, password } = result.data;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/dashboard');
}

export async function signInWithGoogle() {
  try {
    await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/dashboard');
}

export async function signInWithFacebook() {
  try {
    await signInWithPopup(auth, facebookProvider);
  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/dashboard');
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/');
}
