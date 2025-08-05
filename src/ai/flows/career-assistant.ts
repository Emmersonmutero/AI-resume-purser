'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Resume Review Flow
const ResumeReviewInputSchema = z.object({
  resumeData: z.object({
    name: z.string(),
    email: z.string(),
    skills: z.array(z.string()),
    experience: z.array(z.object({
      title: z.string(),
      company: z.string(),
      dates: z.string(),
      description: z.string(),
    })),
    education: z.array(z.object({
      institution: z.string(),
      degree: z.string(),
      dates: z.string(),
    })),
  }),
  targetRole: z.string().optional(),
});

const ResumeReviewOutputSchema = z.object({
  overallScore: z.number().describe('Overall resume score from 1-100'),
  strengths: z.array(z.string()).describe('Key strengths identified in the resume'),
  improvements: z.array(z.string()).describe('Specific improvement suggestions'),
  missingElements: z.array(z.string()).describe('Important elements missing from the resume'),
  skillsAssessment: z.object({
    technical: z.array(z.string()),
    soft: z.array(z.string()),
    recommended: z.array(z.string()),
  }),
  formatting: z.object({
    score: z.number(),
    suggestions: z.array(z.string()),
  }),
  summary: z.string().describe('Brief summary of the review'),
});

export const reviewResume = ai.defineFlow(
  {
    name: 'reviewResume',
    inputSchema: ResumeReviewInputSchema,
    outputSchema: ResumeReviewOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'resumeReviewPrompt',
      input: { schema: ResumeReviewInputSchema },
      output: { schema: ResumeReviewOutputSchema },
      prompt: `You are an expert career counselor and resume reviewer. Analyze the following resume and provide comprehensive feedback.

Resume Data:
Name: {{resumeData.name}}
Email: {{resumeData.email}}
Skills: {{#each resumeData.skills}}{{this}}, {{/each}}

Experience:
{{#each resumeData.experience}}
- {{title}} at {{company}} ({{dates}})
  {{description}}
{{/each}}

Education:
{{#each resumeData.education}}
- {{degree}} from {{institution}} ({{dates}})
{{/each}}

{{#if targetRole}}Target Role: {{targetRole}}{{/if}}

Please provide a detailed review focusing on:
1. Overall resume effectiveness
2. Key strengths and accomplishments
3. Areas for improvement
4. Missing elements
5. Skills assessment (technical, soft, recommended)
6. Formatting and presentation
7. A concise summary

Provide specific, actionable feedback that will help improve the resume's effectiveness.`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

// Career Advice Flow
const CareerAdviceInputSchema = z.object({
  currentRole: z.string().optional(),
  desiredRole: z.string().optional(),
  experience: z.number().describe('Years of experience'),
  skills: z.array(z.string()),
  industry: z.string().optional(),
  careerGoals: z.string().optional(),
  challenges: z.array(z.string()).optional(),
});

const CareerAdviceOutputSchema = z.object({
  advice: z.string().describe('Main career advice'),
  skillsToLearn: z.array(z.string()),
  careerPath: z.array(z.string()).describe('Suggested career progression steps'),
  timeframe: z.string().describe('Realistic timeframe for goals'),
  resources: z.array(z.object({
    type: z.string(),
    name: z.string(),
    description: z.string(),
    url: z.string().optional(),
  })),
  nextSteps: z.array(z.string()),
});

export const provideCareerAdvice = ai.defineFlow(
  {
    name: 'provideCareerAdvice',
    inputSchema: CareerAdviceInputSchema,
    outputSchema: CareerAdviceOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'careerAdvicePrompt',
      input: { schema: CareerAdviceInputSchema },
      output: { schema: CareerAdviceOutputSchema },
      prompt: `You are an experienced career counselor providing personalized career advice.

Current Situation:
- Current Role: {{currentRole}}
- Desired Role: {{desiredRole}}
- Years of Experience: {{experience}}
- Current Skills: {{#each skills}}{{this}}, {{/each}}
- Industry: {{industry}}
- Career Goals: {{careerGoals}}
{{#if challenges}}
- Challenges: {{#each challenges}}{{this}}, {{/each}}
{{/if}}

Provide comprehensive career advice including:
1. Strategic career guidance
2. Skills to develop or learn
3. Career progression path
4. Realistic timeframe
5. Learning resources and certifications
6. Specific next steps to take

Be encouraging, realistic, and provide actionable advice tailored to their situation.`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

// Interview Preparation Flow
const InterviewPrepInputSchema = z.object({
  jobTitle: z.string(),
  company: z.string().optional(),
  jobDescription: z.string().optional(),
  interviewType: z.enum(['phone', 'video', 'in-person', 'technical', 'behavioral']),
  experience: z.number(),
  skills: z.array(z.string()),
  concerns: z.array(z.string()).optional(),
});

const InterviewPrepOutputSchema = z.object({
  preparation: z.string().describe('General interview preparation advice'),
  commonQuestions: z.array(z.object({
    question: z.string(),
    tips: z.string(),
    sampleAnswer: z.string(),
  })),
  technicalPrep: z.array(z.string()).optional(),
  questionsToAsk: z.array(z.string()),
  redFlags: z.array(z.string()),
  timeline: z.string(),
  confidence: z.array(z.string()).describe('Confidence building tips'),
});

export const prepareForInterview = ai.defineFlow(
  {
    name: 'prepareForInterview',
    inputSchema: InterviewPrepInputSchema,
    outputSchema: InterviewPrepOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'interviewPrepPrompt',
      input: { schema: InterviewPrepInputSchema },
      output: { schema: InterviewPrepOutputSchema },
      prompt: `You are an expert interview coach helping someone prepare for their upcoming interview.

Interview Details:
- Job Title: {{jobTitle}}
{{#if company}}- Company: {{company}}{{/if}}
{{#if jobDescription}}- Job Description: {{jobDescription}}{{/if}}
- Interview Type: {{interviewType}}
- Years of Experience: {{experience}}
- Skills: {{#each skills}}{{this}}, {{/each}}
{{#if concerns}}
- Concerns: {{#each concerns}}{{this}}, {{/each}}
{{/if}}

Provide comprehensive interview preparation including:
1. General preparation strategy
2. Common questions likely to be asked with tips and sample answers
3. Technical preparation (if applicable)
4. Good questions for the candidate to ask
5. Red flags to watch for
6. Preparation timeline
7. Confidence building strategies

Tailor the advice to their experience level and the specific role.`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

// Job Matching Analysis Flow
const JobMatchInputSchema = z.object({
  userSkills: z.array(z.string()),
  experience: z.number(),
  preferences: z.object({
    location: z.string().optional(),
    remote: z.boolean().optional(),
    salaryRange: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
    jobType: z.string().optional(),
  }),
  jobDescription: z.string(),
  jobTitle: z.string(),
});

const JobMatchOutputSchema = z.object({
  matchScore: z.number().describe('Match score from 0-100'),
  analysis: z.string().describe('Detailed match analysis'),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  recommendations: z.array(z.string()),
  salaryInsight: z.string().optional(),
  applicationTips: z.array(z.string()),
});

export const analyzeJobMatch = ai.defineFlow(
  {
    name: 'analyzeJobMatch',
    inputSchema: JobMatchInputSchema,
    outputSchema: JobMatchOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'jobMatchPrompt',
      input: { schema: JobMatchInputSchema },
      output: { schema: JobMatchOutputSchema },
      prompt: `You are an expert career advisor analyzing job fit for a candidate.

Candidate Profile:
- Skills: {{#each userSkills}}{{this}}, {{/each}}
- Experience: {{experience}} years
- Location Preference: {{preferences.location}}
- Remote Work: {{preferences.remote}}
- Salary Range: {{preferences.salaryRange.min}} - {{preferences.salaryRange.max}}
- Job Type Preference: {{preferences.jobType}}

Job Details:
- Title: {{jobTitle}}
- Description: {{jobDescription}}

Analyze the match between this candidate and job, providing:
1. Overall match score (0-100)
2. Detailed analysis of the fit
3. Candidate's key strengths for this role
4. Skill or experience gaps
5. Recommendations to improve candidacy
6. Salary market insight (if applicable)
7. Specific tips for applying to this position

Be honest about gaps while remaining encouraging and constructive.`,
    });

    const { output } = await prompt(input);
    return output!;
  }
);

// Export types for use in other files
export type ResumeReviewInput = z.infer<typeof ResumeReviewInputSchema>;
export type ResumeReviewOutput = z.infer<typeof ResumeReviewOutputSchema>;
export type CareerAdviceInput = z.infer<typeof CareerAdviceInputSchema>;
export type CareerAdviceOutput = z.infer<typeof CareerAdviceOutputSchema>;
export type InterviewPrepInput = z.infer<typeof InterviewPrepInputSchema>;
export type InterviewPrepOutput = z.infer<typeof InterviewPrepOutputSchema>;
export type JobMatchInput = z.infer<typeof JobMatchInputSchema>;
export type JobMatchOutput = z.infer<typeof JobMatchOutputSchema>;