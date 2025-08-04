'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/auth';
import type { User } from 'firebase/auth';

export default function DashboardRootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        try {
          const role = await getUserRole(user.uid);
          if (role === 'recruiter') {
            router.replace('/dashboard/recruiter');
          } else {
            router.replace('/dashboard/job-seeker');
          }
        } catch (error) {
          console.error("Failed to get user role, defaulting to job-seeker.", error);
          // Default to job-seeker on error, but don't stop loading until redirect happens
          router.replace('/dashboard/job-seeker');
        }
      } else {
        // User is not logged in, redirect to login page.
        router.replace('/login');
      }
      // Note: setLoading(false) is not strictly needed as redirection will unmount this component.
      // However, if there was a case where it didn't redirect, we'd want to stop the loading skeleton.
      // For this logic, redirection is guaranteed.
    });

    // Cleanup subscription on unmount
    return () => {
        unsubscribe();
    }
  }, [router]);
  
  // Always show a loading skeleton while the redirection logic completes.
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-center">Loading your dashboard...</h1>
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    </div>
  );
}
