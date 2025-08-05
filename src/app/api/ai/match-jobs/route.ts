import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireRole } from '@/lib/auth-utils';
import { matchResumeToJobs } from '@/ai/flows/match-resume-to-jobs';
import { z } from 'zod';

const matchJobsSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  maxResults: z.number().min(1).max(50).default(10),
  minMatchScore: z.number().min(0).max(100).default(50),
});

export const POST = requireRole('job-seeker')(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { resumeId, maxResults, minMatchScore } = matchJobsSchema.parse(body);

    // Get the user's resume
    const resumeDoc = await getDocs(
      query(
        collection(db, 'resumes'),
        where('userId', '==', user.uid),
        where('id', '==', resumeId)
      )
    );

    if (resumeDoc.empty) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resumeData = resumeDoc.docs[0].data();

    // Get active job postings
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('isActive', '==', true),
      limit(100) // Limit to prevent excessive AI processing
    );

    const jobsSnapshot = await getDocs(jobsQuery);
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (jobs.length === 0) {
      return NextResponse.json({
        success: true,
        matches: [],
        message: 'No active jobs found',
      });
    }

    // Use AI to match resume to jobs
    const matchResult = await matchResumeToJobs({
      resumeData: resumeData.extractedData,
      jobPostings: jobs.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        skills: job.skills || [],
      })),
    });

    // Filter by minimum match score and limit results
    const filteredMatches = matchResult.matches
      ?.filter(match => match.matchScore >= minMatchScore)
      ?.slice(0, maxResults)
      ?.map(match => {
        const job = jobs.find(j => j.id === match.jobId);
        return {
          ...match,
          job: {
            id: job?.id,
            title: job?.title,
            company: job?.company,
            location: job?.location,
            jobType: job?.jobType,
            experienceLevel: job?.experienceLevel,
            remote: job?.remote,
            salaryRange: job?.salaryRange,
            createdAt: job?.createdAt?.toDate()?.toISOString(),
          },
        };
      }) || [];

    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      totalJobsAnalyzed: jobs.length,
      matchesFound: filteredMatches.length,
    });

  } catch (error: any) {
    console.error('Error matching jobs:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to match jobs' },
      { status: 500 }
    );
  }
});