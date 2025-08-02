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
        // User is authenticated, proceed with role-based redirect.
        try {
          const role = await getUserRole(user.uid);
          if (role === 'recruiter') {
            router.replace('/dashboard/recruiter');
          } else {
            router.replace('/dashboard/job-seeker');
          }
        } catch (error) {
          console.error("Failed to get user role, defaulting to job-seeker.", error);
          // Default to job-seeker on error, but still redirect.
          router.replace('/dashboard/job-seeker');
        }
      } else {
        // onAuthStateChanged confirmed there is no user. 
        // It's now safe to redirect to login.
        setLoading(false); // Stop loading
        router.replace('/login');
      }
    });

    // Cleanup the subscription on component unmount
    return () => unsubscribe();
  }, [router]);
  
  // Display a loading skeleton while we wait for onAuthStateChanged to fire.
  // This prevents any premature redirects or flicker.
  if (loading) {
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

  // This part of the component will effectively not be reached because the effect
  // will either redirect to a role-based dashboard or the login page.
  // It's here as a fallback.
  return null;
}
