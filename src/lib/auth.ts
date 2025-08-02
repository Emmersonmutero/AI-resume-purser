import { getAuth } from 'firebase/auth';
import { app } from './firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';


const authInstance = getAuth(app);
const db = getFirestore(app);

// Export a getter for the auth instance to be used in client components
export const auth = authInstance;


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
