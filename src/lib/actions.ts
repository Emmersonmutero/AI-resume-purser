'use server';

import {
  extractResumeData,
  type ExtractResumeDataOutput,
} from '@/ai/flows/extract-resume-data';
import {
  generateResumeSummary,
  type GenerateResumeSummaryOutput,
} from '@/ai/flows/generate-resume-summary';
import {
  matchResumeToJobs,
  type MatchResumeToJobsOutput,
} from '@/ai/flows/match-resume-to-jobs';
import {z} from 'zod';
import { fileTypeFromBuffer } from 'file-type';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { app } from './firebase';
import { redirect } from 'next/navigation';
import { auth as authInstance } from './auth';

const db = getFirestore(app);

export type JobPosting = {
  id: string;
  title: string;
  company: string;
  description: string;
  postedBy: string;
  createdAt: Date;
}

export type Application = {
    id: string;
    jobId: string;
    jobTitle: string;
    applicantId: string;
    applicantName: string;
    applicantEmail: string;
    matchScore: number;
    resumeData: ExtractResumeDataOutput;
    appliedAt: Timestamp;
};

export type ProcessedResumeData = {
  resumeData: ExtractResumeDataOutput;
  summary: GenerateResumeSummaryOutput;
  matches: MatchResumeToJobsOutput;
  jobs: JobPosting[];
};


async function fileToDataUri(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${file.type};base64,${base64}`;
}


export async function handleResumeUpload(
  formData: FormData
): Promise<{data: ProcessedResumeData | null; error: string | null}> {
  const file = formData.get('resume') as File;

  const fileSchema = z.object({
    name: z.string(),
    size: z
      .number()
      .max(5 * 1024 * 1024, {message: 'File size must be less than 5MB.'}),
    type: z.string().refine(type => type === 'application/pdf' || type === 'text/plain', {
        message: "Only PDF and TXT files are allowed."
    })
  });

  const validation = fileSchema.safeParse(file);

  if (!validation.success) {
    const errorMessages = validation.error.errors
      .map(e => e.message)
      .join(', ');
    return {data: null, error: errorMessages};
  }

  try {
    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    const jobs: JobPosting[] = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobPosting));
    const jobPostingsText = jobs.map(job => `${job.title} at ${job.company}: ${job.description}`);

    if (jobs.length === 0) {
        return { data: null, error: "No job postings are available yet. Please check back later." };
    }


    const dataUri = await fileToDataUri(file);

    // 1. Extract structured data from resume
    const resumeData = await extractResumeData({resumeDataUri: dataUri});

    // 2. Create a text representation for other AI flows
    const resumeText = `
      Name: ${resumeData.name}
      Email: ${resumeData.email}
      Phone: ${resumeData.phone}
      Links: ${resumeData.links.join(', ')}
      Skills: ${resumeData.skills.join(', ')}\n\n
      Experience:\n${resumeData.experience
        .map(
          exp =>
            `Title: ${exp.title} at ${exp.company} (${exp.dates})\nDescription: ${exp.description}`
        )
        .join('\n\n')}\n\n
      Education:\n${resumeData.education
        .map(
          edu =>
            `Degree: ${edu.degree} from ${edu.institution} (${edu.dates})`
        )
        .join('\n')}
    `;

    // 3. Generate summary and match to jobs in parallel
    const [summary, matches] = await Promise.all([
      generateResumeSummary({resumeText}),
      matchResumeToJobs({
        resumeText,
        jobPostings: jobPostingsText,
      }),
    ]);

    return {data: {resumeData, summary, matches, jobs}, error: null};
  } catch (error) {
    console.error('AI processing failed:', error);
    return {
      data: null,
      error:
        'Failed to process resume with AI. The document might be malformed or unreadable.',
    };
  }
}

const jobPostingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  company: z.string().min(2, "Company name must be at least 2 characters long."),
  description: z.string().min(20, "Description must be at least 20 characters long."),
});

export async function createJobPosting(formData: FormData) {
    const user = authInstance.currentUser;
    if (!user) {
        return { success: false, error: "You must be logged in to post a job." };
    }

    const result = jobPostingSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        const errorMessages = result.error.errors.map(e => e.message).join(', ');
        return { success: false, error: errorMessages };
    }

    try {
        await addDoc(collection(db, "jobs"), {
            ...result.data,
            postedBy: user.uid,
            createdAt: new Date(),
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating job posting:", error);
        return { success: false, error: "Failed to create job posting." };
    }
}


export async function applyForJob(
    jobId: string,
    jobTitle: string,
    matchScore: number,
    resumeData: ExtractResumeDataOutput
) {
    const user = authInstance.currentUser;
    if (!user) {
        return { success: false, error: "You must be logged in to apply." };
    }

    try {
        await addDoc(collection(db, 'applications'), {
            jobId,
            jobTitle,
            applicantId: user.uid,
            applicantName: resumeData.name,
            applicantEmail: resumeData.email,
            matchScore,
            resumeData,
            appliedAt: new Date(),
        });
         return { success: true };
    } catch (error) {
        console.error("Error applying for job:", error);
        return { success: false, error: "Failed to submit application." };
    }
}


export async function getApplicantsForRecruiter(recruiterId: string): Promise<Application[]> {
    try {
        const jobsQuery = query(collection(db, 'jobs'), where('postedBy', '==', recruiterId));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobIds = jobsSnapshot.docs.map(doc => doc.id);

        if (jobIds.length === 0) {
            return [];
        }

        const applicationsQuery = query(collection(db, 'applications'), where('jobId', 'in', jobIds));
        const applicationsSnapshot = await getDocs(applicationsQuery);

        const applicants = applicationsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Application));

        return applicants.sort((a, b) => b.appliedAt.toDate().getTime() - a.appliedAt.toDate().getTime());
    } catch (error) {
        console.error("Error fetching applicants:", error);
        return [];
    }
}

export async function getUserRole(userId: string): Promise<string | null> {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
            return userDoc.data().role || 'job-seeker';
        }
        return 'job-seeker'; // Default to job-seeker if doc doesn't exist
    } catch (error) {
        console.error("Error fetching user role:", error);
        return null;
    }
}


const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['job-seeker', 'recruiter']),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpWithEmail(formData: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email, password, or role format.' };
  }
  const { email, password, role } = result.data;
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
    });

  } catch (error: any) {
    return { error: error.message };
  }
}

export async function signInWithEmail(formData: FormData) {
  const result = signInSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { error: 'Invalid email or password format.' };
  }
  const { email, password } = result.data;
  try {
    await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error: any)
   {
    return { error: error.message };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(authInstance);
  } catch (error: any) {
    return { error: error.message };
  }
  redirect('/');
}
