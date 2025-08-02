'use server';

import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { app } from './firebase';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getFirestore, doc, setDoc } from 'firebase/firestore';


const auth = getAuth(app);
const db = getFirestore(app);

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['job-seeker', 'recruiter']),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpWithEmail(formData: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email, password, or role format.' };
  }
  const { email, password, role } = result.data;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save user role to Firestore
    await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
    });

  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/dashboard');
}

export async function signInWithEmail(formData: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email or password format.' };
  }
  const { email, password } = result.data;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any)
   {
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
