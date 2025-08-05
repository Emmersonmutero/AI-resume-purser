import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireAuth } from '@/lib/auth-utils';
import { z } from 'zod';

const updateApplicationSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'interviewed', 'offered', 'hired', 'rejected']),
  notes: z.string().optional(),
});

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const applicationId = request.url.split('/').pop();
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
    
    if (!applicationDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const applicationData = applicationDoc.data();
    
    // Check authorization
    const isApplicant = user.role === 'job-seeker' && applicationData.applicantId === user.uid;
    const isRecruiter = user.role === 'recruiter' && applicationData.recruiterId === user.uid;
    
    if (!isApplicant && !isRecruiter) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to view this application' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: applicationDoc.id,
        ...applicationData,
        appliedAt: applicationData.appliedAt?.toDate()?.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error fetching application:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
});

export const PATCH = requireAuth(async (request: NextRequest, user) => {
  try {
    const applicationId = request.url.split('/').pop();
    const body = await request.json();
    
    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const applicationDoc = await getDoc(doc(db, 'applications', applicationId));
    
    if (!applicationDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      );
    }

    const applicationData = applicationDoc.data();
    
    // Only recruiters can update application status
    if (user.role !== 'recruiter' || applicationData.recruiterId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this application' },
        { status: 403 }
      );
    }

    const updateData = updateApplicationSchema.parse(body);

    await updateDoc(doc(db, 'applications', applicationId), {
      ...updateData,
      updatedAt: new Date(),
      updatedBy: user.uid,
    });

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating application:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update application' },
      { status: 500 }
    );
  }
});