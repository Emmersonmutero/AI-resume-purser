'use client';

import { getAuth } from 'firebase/auth';
import { app } from './firebase';

const authInstance = getAuth(app);

export const auth = authInstance;
