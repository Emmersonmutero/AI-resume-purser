import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, addDoc, query, where, getDocs, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { requireRole } from '@/lib/auth-utils';
import { matchResumeToJobs } from '@/ai/flows/match-resume-to-jobs';
import { z } from 'zod';

const applyJobSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  coverLetter: z.string().optional(),
});

export const POST = requireRole('job-seeker')(async (request: NextRequest, user) => {
  try {
    const jobId = request.url.split('/').slice(-2, -1)[0]; // Extract job ID from URL
    const body = await request.json();
    const { resumeId, coverLetter } = applyJobSchema.parse(body);

    // Check if job exists
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobData = jobDoc.data();
    
    // Check if job is active
    if (!jobData.isActive) {
      return NextResponse.json(
        { success: false, error: 'This job is no longer active' },
        { status: 400 }
      );
    }

    // Check if resume exists and belongs to user
    const resumeDoc = await getDoc(doc(db, 'resumes', resumeId));
    if (!resumeDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Resume not found' },
        { status: 404 }
      );
    }

    const resumeData = resumeDoc.data();
    if (resumeData.userId !== user.uid) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to use this resume' },
        { status: 403 }
      );
    }

    // Check if user has already applied to this job
    const existingApplicationQuery = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('applicantId', '==', user.uid)
    );
    const existingApplications = await getDocs(existingApplicationQuery);
    
    if (!existingApplications.empty) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job' },
        { status: 409 }
      );
    }

    // Calculate match score using AI
    const matchResult = await matchResumeToJobs({
      resumeData: resumeData.extractedData,
      jobPostings: [{
        id: jobId,
        title: jobData.title,
        company: jobData.company,
        description: jobData.description,
        skills: jobData.skills || [],
      }],
    });

    const matchScore = matchResult.matches?.[0]?.matchScore || 0;
    const matchExplanation = matchResult.matches?.[0]?.explanation || '';

    // Create application
    const applicationDoc = await addDoc(collection(db, 'applications'), {
      jobId,
      jobTitle: jobData.title,
      jobCompany: jobData.company,
      applicantId: user.uid,
      applicantName: user.displayName || resumeData.extractedData.name,
      applicantEmail: user.email,
      resumeId,
      resumeData: resumeData.extractedData,
      matchScore,
      matchExplanation,
      coverLetter: coverLetter || null,
      appliedAt: new Date(),
      status: 'pending',
      recruiterId: jobData.postedBy,
    });

    // Update job applications count
    await updateDoc(doc(db, 'jobs', jobId), {
      applicationsCount: increment(1),
    });

    return NextResponse.json({
      success: true,
      applicationId: applicationDoc.id,
      matchScore,
      matchExplanation,
      message: 'Application submitted successfully',
    });

  } catch (error: any) {
    console.error('Error applying to job:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to apply to job' },
      { status: 500 }
    );
  }
});