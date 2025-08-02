
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/auth';
import { getUserRole } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardRootPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
          router.replace('/dashboard/job-seeker');
        }
      } else {
        // If onAuthStateChanged confirms there's no user, *then* redirect.
        // We set loading to false to prevent a race condition on initial load.
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);
  
  // Only redirect to login if loading is complete and there's still no user.
  useEffect(() => {
    if (!loading && !auth.currentUser) {
        router.replace('/login');
    }
  }, [loading, router]);

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
  )
}
