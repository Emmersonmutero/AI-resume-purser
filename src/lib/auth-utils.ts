import { NextRequest } from 'next/server';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export type AuthenticatedUser = {
  uid: string;
  email: string;
  role: 'job-seeker' | 'recruiter';
  displayName?: string;
};

export async function getUserFromRequest(request: NextRequest): Promise<AuthenticatedUser | null> {
  const userId = request.headers.get('x-user-id');
  const userEmail = request.headers.get('x-user-email');
  
  if (!userId || !userEmail) {
    return null;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }

    const userData = userDoc.data();
    
    return {
      uid: userId,
      email: userEmail,
      role: userData.role,
      displayName: userData.displayName,
    };
  } catch (error) {
    console.error('Error fetching user from request:', error);
    return null;
  }
}

export function requireAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
  return async (request: NextRequest) => {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return handler(request, user);
  };
}

export function requireRole(role: 'job-seeker' | 'recruiter') {
  return function(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<Response>) {
    return async (request: NextRequest) => {
      const user = await getUserFromRequest(request);
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (user.role !== role) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return handler(request, user);
    };
  };
}