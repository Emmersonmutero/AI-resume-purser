import { getAuth } from 'firebase/auth';
import { app } from './firebase';

const authInstance = getAuth(app);
// Mock user for client-side checks
if (typeof window !== 'undefined') {
    Object.defineProperty(authInstance, 'currentUser', {
        value: {
            uid: 'mock-user-id',
            email: 'user@example.com',
            displayName: 'Mock User',
            photoURL: 'https://placehold.co/40x40.png',
            reload: async () => {},
        },
        writable: true,
    });
}


// Export a getter for the auth instance to be used in client components
export const auth = authInstance;
