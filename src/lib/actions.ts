"use server";

import { extractResumeData, type ExtractResumeDataOutput } from "@/ai/flows/extract-resume-data";
import { generateResumeSummary, type GenerateResumeSummaryOutput } from "@/ai/flows/generate-resume-summary";
import { matchResumeToJobs, type MatchResumeToJobsOutput } from "@/ai/flows/match-resume-to-jobs";
import { z } from "zod";

export type ProcessedResumeData = {
  resumeData: ExtractResumeDataOutput;
  summary: GenerateResumeSummaryOutput;
  matches: MatchResumeToJobsOutput;
};

// Mock job postings for demonstration
const MOCK_JOB_POSTINGS = [
  "Senior Frontend Engineer at TechCorp. Requirements: React, TypeScript, 5+ years experience. Focus on building scalable UI components and design systems.",
  "Backend Developer at DataMine Inc. Requirements: Node.js, Python, SQL, AWS. Experience with microservices and data pipelines is a plus.",
  "Full Stack Developer at Innovate LLC. We are looking for a versatile developer proficient in MERN stack. Experience with GraphQL is highly desired.",
  "Product Manager at SolutionFoundry. Drive product strategy for our new AI platform. Must have a technical background and experience in a SaaS environment.",
  "UI/UX Designer at CreativeMinds. Create intuitive and beautiful user interfaces for our mobile and web applications. Proficiency in Figma and Adobe Suite required.",
];

export async function handleResumeUpload(formData: FormData): Promise<{ data: ProcessedResumeData | null; error: string | null; }> {
  const file = formData.get("resume") as File;
  
  const fileSchema = z.object({
      name: z.string(),
      size: z.number().max(5 * 1024 * 1024, { message: "File size must be less than 5MB." }),
      type: z.literal("application/pdf", { errorMap: () => ({ message: "Only PDF files are allowed." }) })
  });

  const validation = fileSchema.safeParse(file);

  if (!validation.success) {
      const errorMessages = validation.error.errors.map(e => e.message).join(', ');
      return { data: null, error: errorMessages };
  }

  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:application/pdf;base64,${base64}`;

    // 1. Extract structured data from resume
    const resumeData = await extractResumeData({ resumeDataUri: dataUri });

    // 2. Create a text representation for other AI flows
    const resumeText = `
      Skills: ${resumeData.skills.join(", ")}\n\n
      Experience:\n${resumeData.experience
        .map(
          (exp) =>
            `Title: ${exp.title} at ${exp.company} (${exp.dates})\nDescription: ${exp.description}`
        )
        .join("\n\n")}\n\n
      Education:\n${resumeData.education
        .map(
          (edu) =>
            `Degree: ${edu.degree} from ${edu.institution} (${edu.dates})`
        )
        .join("\n")}
    `;

    // 3. Generate summary
    const summary = await generateResumeSummary({ resumeText });

    // 4. Match to jobs
    const matches = await matchResumeToJobs({
      resumeText,
      jobPostings: MOCK_JOB_POSTINGS,
    });

    return { data: { resumeData, summary, matches }, error: null };
  } catch (error) {
    console.error("AI processing failed:", error);
    return { data: null, error: "Failed to process resume with AI. The document might be malformed or unreadable." };
  }
}
