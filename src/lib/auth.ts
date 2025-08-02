'use client';

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';
import type { User } from 'firebase/auth';

const authInstance = getAuth(app);

// To ensure the mock user is consistently available, we'll use a more robust approach.
// This ensures that any part of the app asking for the current user gets the mock data,
// preventing race conditions or null user errors within the dashboard.

// The mock user object
const mockUser: User = {
    uid: 'mock-user-id',
    email: 'user@example.com',
    displayName: 'Mock User',
    photoURL: 'https://placehold.co/40x40.png',
    providerId: 'password',
    emailVerified: true,
    isAnonymous: false,
    metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    // Dummy methods to match the User type
    delete: async () => {},
    getIdToken: async () => 'mock-id-token',
    getIdTokenResult: async () => ({
        token: 'mock-id-token',
        claims: {},
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        signInProvider: 'password',
        signInSecondFactor: null,
        expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    }),
    reload: async () => {},
    toJSON: () => ({}),
};


// We override the currentUser getter to always return our mock user.
Object.defineProperty(authInstance, 'currentUser', {
    value: mockUser,
    writable: false, // Prevent accidental overwrites
});

// We also override onAuthStateChanged to immediately call back with the mock user.
// This simulates an already authenticated session for any listeners.
const originalOnAuthStateChanged = onAuthStateChanged;
(authInstance as any).onAuthStateChanged = (callback: (user: User | null) => void) => {
    // Immediately invoke the callback with the mock user
    callback(mockUser);
    // Return a dummy unsubscribe function
    return () => {};
};


export const auth = authInstance;
