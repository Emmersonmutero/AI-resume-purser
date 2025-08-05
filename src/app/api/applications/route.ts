import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireAuth } from '@/lib/auth-utils';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const jobId = searchParams.get('jobId');

    let applicationsQuery;

    if (user.role === 'job-seeker') {
      // Job seekers see their own applications
      applicationsQuery = query(
        collection(db, 'applications'),
        where('applicantId', '==', user.uid),
        orderBy('appliedAt', 'desc')
      );
    } else if (user.role === 'recruiter') {
      // Recruiters see applications for their jobs
      applicationsQuery = query(
        collection(db, 'applications'),
        where('recruiterId', '==', user.uid),
        orderBy('appliedAt', 'desc')
      );
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid user role' },
        { status: 403 }
      );
    }

    // Add filters
    if (status) {
      applicationsQuery = query(applicationsQuery, where('status', '==', status));
    }
    if (jobId) {
      applicationsQuery = query(applicationsQuery, where('jobId', '==', jobId));
    }

    const querySnapshot = await getDocs(applicationsQuery);
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate()?.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      applications,
    });

  } catch (error: any) {
    console.error('Error fetching applications:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
});