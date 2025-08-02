'use server';

/**
 * @fileOverview Matches a resume against existing job postings and provides a ranked list of the most relevant opportunities.
 *
 * - matchResumeToJobs - A function that handles the resume matching process.
 * - MatchResumeToJobsInput - The input type for the matchResumeTojobs function.
 * - MatchResumeToJobsOutput - The return type for the matchResumeTojobs function.
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
    matchScore: z
      .number()
      .min(0)
      .max(1)
      .describe(
        'A score indicating the relevance of the resume to the job posting (0-1). The score should reflect a deep understanding of the skills and experience required.'
      ),
    reason: z
      .string()
      .describe(
        'Reasoning why this job posting matched, in one sentence. Be specific about which skills or experiences were a good fit.'
      ),
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
  prompt: `You are an AI job matching expert. Your goal is to provide the most accurate and helpful job recommendations.
Given a resume and a list of job postings, rank the job postings by relevance to the resume.

Analyze the resume's skills, experience level (junior, mid, senior), and past responsibilities. Compare this against the requirements in each job posting.

Assign a 'matchScore' from 0 to 1, where 1 is a perfect match. The score should be based on a holistic view, not just keyword matching. For example, if the resume shows 10 years of experience in backend development, a "Senior Backend Engineer" role is a better match than a "Junior Frontend" one, even if they share some keywords.

For the 'reason', provide a concise, insightful explanation for the match, highlighting specific skill or experience alignment.

Resume:
{{{resumeText}}}

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
    // Sort by score descending before returning
    const sortedOutput = output?.sort((a, b) => b.matchScore - a.matchScore);
    return sortedOutput!;
  }
);
