'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserRole } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { auth } from '@/lib/auth';

export default function DashboardRootPage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      // Because we've mocked the auth layer, auth.currentUser will always be populated.
      // This simulates a persistent login session.
      const user = auth.currentUser;

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
        // This case should not be reached with the current mock setup,
        // but it's good practice to keep it as a fallback for real authentication.
        router.replace('/login');
      }
    };
    checkAuthAndRedirect();
  }, [router]);
  
  // Display a loading skeleton while the redirection logic completes.
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
