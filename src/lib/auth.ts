import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { app } from './firebase';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


const authInstance = getAuth(app);
const db = getFirestore(app);

// Export a getter for the auth instance to be used in client components
export const auth = authInstance;


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
  'use server';
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email, password, or role format.' };
  }
  const { email, password, role } = result.data;
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
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
  'use server';
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email or password format.' };
  }
  const { email, password } = result.data;
  try {
    await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error: any)
   {
    return { error: error.message };
  }
  redirect('/dashboard');
}

export async function signOut() {
  'use server';
  try {
    await firebaseSignOut(authInstance);
  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/');
}


export async function getUserRole(userId: string): Promise<string | null> {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return userDoc.data().role || 'job-seeker';
        }
        return 'job-seeker'; // Default to job-seeker if doc doesn't exist
    } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
    }
}
