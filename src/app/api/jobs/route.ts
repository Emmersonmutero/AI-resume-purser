import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireAuth, requireRole } from '@/lib/auth-utils';
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(3, 'Job title must be at least 3 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  description: z.string().min(50, 'Job description must be at least 50 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  salaryRange: z.object({
    min: z.number().min(0, 'Minimum salary must be positive'),
    max: z.number().min(0, 'Maximum salary must be positive'),
  }).optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  benefits: z.array(z.string()).optional(),
  remote: z.boolean().default(false),
});

// GET /api/jobs - Get all jobs with optional filtering
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('limit') || '20'), 50); // Cap at 50
    const searchTerm = searchParams.get('search') || '';
    const jobType = searchParams.get('jobType');
    const experienceLevel = searchParams.get('experienceLevel');
    const remote = searchParams.get('remote');

    let jobsQuery = query(
      collection(db, 'jobs'),
      orderBy('createdAt', 'desc')
    );

    // Add filters
    if (jobType) {
      jobsQuery = query(jobsQuery, where('jobType', '==', jobType));
    }
    if (experienceLevel) {
      jobsQuery = query(jobsQuery, where('experienceLevel', '==', experienceLevel));
    }
    if (remote === 'true') {
      jobsQuery = query(jobsQuery, where('remote', '==', true));
    }

    // Add pagination
    jobsQuery = query(jobsQuery, limit(pageSize));

    const querySnapshot = await getDocs(jobsQuery);
    let jobs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString(),
    }));

    // Client-side filtering for search term (full-text search would be better with Algolia)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      jobs = jobs.filter(job => 
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.skills.some((skill: string) => skill.toLowerCase().includes(searchLower))
      );
    }

    return NextResponse.json({
      success: true,
      jobs,
      pagination: {
        page,
        pageSize,
        total: jobs.length,
      },
    });

  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
};

// POST /api/jobs - Create a new job (recruiter only)
export const POST = requireRole('recruiter')(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const jobData = createJobSchema.parse(body);

    // Validate salary range
    if (jobData.salaryRange && jobData.salaryRange.min > jobData.salaryRange.max) {
      return NextResponse.json(
        { success: false, error: 'Minimum salary cannot be greater than maximum salary' },
        { status: 400 }
      );
    }

    const jobDoc = await addDoc(collection(db, 'jobs'), {
      ...jobData,
      postedBy: user.uid,
      recruiterName: user.displayName || user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      applicationsCount: 0,
    });

    return NextResponse.json({
      success: true,
      jobId: jobDoc.id,
      message: 'Job posted successfully',
    });

  } catch (error: any) {
    console.error('Error creating job:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create job' },
      { status: 500 }
    );
  }
});