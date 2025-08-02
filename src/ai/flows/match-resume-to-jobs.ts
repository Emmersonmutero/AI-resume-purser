// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Matches a resume against existing job postings and provides a ranked list of the most relevant opportunities.
 *
 * - matchResumeToJobs - A function that handles the resume matching process.
 * - MatchResumeToJobsInput - The input type for the matchResumeToJobs function.
 * - MatchResumeToJobsOutput - The return type for the matchResumeToJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchResumeToJobsInputSchema = z.object({
  resumeText: z.string().describe('The text content of the resume.'),
  jobPostings: z.array(z.string()).describe('An array of job posting descriptions.'),
});
export type MatchResumeToJobsInput = z.infer<typeof MatchResumeToJobsInputSchema>;

const MatchResumeToJobsOutputSchema = z.array(
  z.object({
    jobPosting: z.string().describe('The job posting description.'),
    matchScore: z.number().describe('A score indicating the relevance of the resume to the job posting (0-1).'),
    reason: z.string().describe('Reasoning why this job posting matched, in one sentence.'),
  })
);
export type MatchResumeToJobsOutput = z.infer<typeof MatchResumeToJobsOutputSchema>;

export async function matchResumeToJobs(input: MatchResumeToJobsInput): Promise<MatchResumeToJobsOutput> {
  return matchResumeToJobsFlow(input);
}

const matchResumeToJobsPrompt = ai.definePrompt({
  name: 'matchResumeToJobsPrompt',
  input: {schema: MatchResumeToJobsInputSchema},
  output: {schema: MatchResumeToJobsOutputSchema},
  prompt: `You are an AI job matching expert. Given a resume and a list of job postings, rank the job postings by relevance to the resume.

Resume:
{{resumeText}}

Job Postings:
{{#each jobPostings}}
- {{{this}}}
{{/each}}

Output a ranked list of job postings with a match score (0-1) and a short explanation for each. Reason in one sentence.

Format your response as a JSON array of objects with 'jobPosting', 'matchScore', and 'reason' fields.
`,
});

const matchResumeToJobsFlow = ai.defineFlow(
  {
    name: 'matchResumeToJobsFlow',
    inputSchema: MatchResumeToJobsInputSchema,
    outputSchema: MatchResumeToJobsOutputSchema,
  },
  async input => {
    const {output} = await matchResumeToJobsPrompt(input);
    return output!;
  }
);
