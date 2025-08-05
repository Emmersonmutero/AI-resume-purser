import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireAuth, requireRole } from '@/lib/auth-utils';
import { z } from 'zod';

const updateJobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters').optional(),
  company: z.string().min(2, 'Company name must be at least 2 characters').optional(),
  description: z.string().min(50, 'Job description must be at least 50 characters').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').optional(),
  salaryRange: z.object({
    min: z.number().min(0, 'Minimum salary must be positive'),
    max: z.number().min(0, 'Maximum salary must be positive'),
  }).optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required').optional(),
  benefits: z.array(z.string()).optional(),
  remote: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/jobs/[id] - Get a specific job
export const GET = async (request: NextRequest) => {
  try {
    const jobId = request.url.split('/').pop();
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    
    if (!jobDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();

    return NextResponse.json({
      success: true,
      job: {
        id: jobDoc.id,
        ...jobData,
        createdAt: jobData.createdAt?.toDate()?.toISOString(),
        updatedAt: jobData.updatedAt?.toDate()?.toISOString(),
      },
    });

  } catch (error: any) {
    console.error('Error fetching job:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch job' },
      { status: 500 }
    );
  }
};

// PATCH /api/jobs/[id] - Update a job (only by the recruiter who posted it)
export const PATCH = requireRole('recruiter')(async (request: NextRequest, user) => {
  try {
    const jobId = request.url.split('/').pop();
    const body = await request.json();
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    
    if (!jobDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();
    
    // Check if user owns this job
    if (jobData.postedBy !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this job' },
        { status: 403 }
      );
    }

    const updateData = updateJobSchema.parse(body);

    // Validate salary range if provided
    if (updateData.salaryRange && updateData.salaryRange.min > updateData.salaryRange.max) {
      return NextResponse.json(
        { success: false, error: 'Minimum salary cannot be greater than maximum salary' },
        { status: 400 }
      );
    }

    await updateDoc(doc(db, 'jobs', jobId), {
      ...updateData,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
    });

  } catch (error: any) {
    console.error('Error updating job:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update job' },
      { status: 500 }
    );
  }
});

// DELETE /api/jobs/[id] - Delete a job (only by the recruiter who posted it)
export const DELETE = requireRole('recruiter')(async (request: NextRequest, user) => {
  try {
    const jobId = request.url.split('/').pop();
    
    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    
    if (!jobDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();
    
    // Check if user owns this job
    if (jobData.postedBy !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this job' },
        { status: 403 }
      );
    }

    await deleteDoc(doc(db, 'jobs', jobId));

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully',
    });

  } catch (error: any) {
    console.error('Error deleting job:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete job' },
      { status: 500 }
    );
  }
});