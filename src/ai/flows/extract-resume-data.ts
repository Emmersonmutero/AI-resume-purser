'use server';

/**
 * @fileOverview An AI agent for extracting key information from a resume.
 *
 * - extractResumeData - A function that handles the resume data extraction process.
 * - ExtractResumeDataInput - The input type for the extractResumeData function.
 * - ExtractResumeDataOutput - The return type for the extractResumeData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractResumeDataInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "A resume document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractResumeDataInput = z.infer<typeof ExtractResumeDataInputSchema>;

const ExtractResumeDataOutputSchema = z.object({
  name: z.string().describe('The full name of the candidate.'),
  email: z.string().describe('The email address of the candidate.'),
  phone: z.string().describe('The phone number of the candidate.'),
  links: z.array(z.string()).describe('A list of URLs to portfolios, LinkedIn, GitHub, etc.'),
  skills: z.array(z.string()).describe('A list of skills extracted from the resume. Normalize skills where possible (e.g., JS to JavaScript).'),
  experience: z
    .array(
      z.object({
        title: z.string().describe('The job title.'),
        company: z.string().describe('The company name.'),
        dates: z.string().describe('The start and end dates of the job.'),
        description: z.string().describe('A description of the job responsibilities.'),
      })
    )
    .describe('A list of work experiences extracted from the resume.'),
  education: z
    .array(
      z.object({
        institution: z.string().describe('The name of the educational institution.'),
        degree: z.string().describe('The degree obtained.'),
        dates: z.string().describe('The start and end dates of the education.'),
      })
    )
    .describe('A list of educational experiences extracted from the resume.'),
});
export type ExtractResumeDataOutput = z.infer<typeof ExtractResumeDataOutputSchema>;

export async function extractResumeData(input: ExtractResumeDataInput): Promise<ExtractResumeDataOutput> {
  return extractResumeDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractResumeDataPrompt',
  input: {schema: ExtractResumeDataInputSchema},
  output: {schema: ExtractResumeDataOutputSchema},
  prompt: `You are an expert resume parser. You will extract key information from the resume provided, including the candidate's name, email, phone number, links, skills, work experience, and education.

  Please normalize skills where appropriate (e.g., "JS" to "JavaScript").
  Please return the data in the JSON format specified by the output schema.

  Here is the resume data:

  {{media url=resumeDataUri}}
  `,
});

const extractResumeDataFlow = ai.defineFlow(
  {
    name: 'extractResumeDataFlow',
    inputSchema: ExtractResumeDataInputSchema,
    outputSchema: ExtractResumeDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
