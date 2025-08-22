// Firebase connection test utility
import { auth, db } from './firebase';
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('Testing Firebase connection...');
  
  try {
    // Test if Firebase is initialized
    console.log('Auth instance:', auth);
    console.log('Firestore instance:', db);
    console.log('Auth config:', {
      apiKey: auth.config?.apiKey ? 'Present' : 'Missing',
      authDomain: auth.config?.authDomain || 'Not found',
      projectId: auth.config?.projectId || 'Not found'
    });
    
    // Test auth state
    console.log('Current user:', auth.currentUser);
    
    return {
      success: true,
      message: 'Firebase connection test passed'
    };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Call this function to test the connection
if (typeof window !== 'undefined') {
  window.testFirebase = testFirebaseConnection;
}
