import { getAuth } from 'firebase/auth';
import { app } from './firebase';

const authInstance = getAuth(app);

// Export a getter for the auth instance to be used in client components
export const auth = authInstance;
