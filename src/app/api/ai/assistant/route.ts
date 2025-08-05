import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { withRateLimit, aiRateLimit } from '@/lib/rate-limiter';
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const assistantRequestSchema = z.object({
  message: z.string().min(1, 'Message is required').max(1000, 'Message too long'),
  context: z.object({
    hasResume: z.boolean().optional(),
    resumeData: z.any().optional(),
    jobPreferences: z.any().optional(),
    recentActivity: z.array(z.string()).optional(),
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string(),
  })).optional(),
});

// Define AI prompts for different types of assistance
const createSystemPrompt = (context: any) => {
  let systemPrompt = `You are an AI Career Assistant for an AI Resume Parser platform. You help users with:

1. Resume optimization and improvement suggestions
2. Job matching and career advice
3. Interview preparation and tips
4. Skills development recommendations
5. General career guidance

Guidelines:
- Be helpful, professional, and encouraging
- Provide specific, actionable advice
- Keep responses concise but informative
- If you don't have enough context, ask clarifying questions
- Always maintain a positive, supportive tone
- Reference the user's resume data when available for personalized advice`;

  if (context?.hasResume && context?.resumeData) {
    systemPrompt += `\n\nUser's Resume Context:
- Name: ${context.resumeData.name || 'Not provided'}
- Skills: ${context.resumeData.skills?.join(', ') || 'Not provided'}
- Experience: ${context.resumeData.experience?.length || 0} positions
- Education: ${context.resumeData.education?.length || 0} entries`;
  }

  if (context?.jobPreferences) {
    systemPrompt += `\n\nUser's Job Preferences:
- Desired role: ${context.jobPreferences.role || 'Not specified'}
- Location: ${context.jobPreferences.location || 'Not specified'}
- Job type: ${context.jobPreferences.jobType || 'Not specified'}`;
  }

  return systemPrompt;
};

const generateResponse = async (message: string, context: any, history: any[]) => {
  const systemPrompt = createSystemPrompt(context);
  
  // Prepare conversation history
  const conversationHistory = history?.slice(-5).map(msg => ({
    role: msg.role,
    content: msg.content
  })) || [];

  try {
    const prompt = ai.definePrompt({
      name: 'careerAssistantPrompt',
      input: {
        schema: z.object({
          message: z.string(),
          systemPrompt: z.string(),
          history: z.array(z.object({
            role: z.string(),
            content: z.string()
          }))
        })
      },
      output: {
        schema: z.object({
          response: z.string(),
          type: z.enum(['text', 'suggestion', 'action']).default('text'),
          suggestions: z.array(z.string()).optional(),
          metadata: z.object({
            category: z.string().optional(),
            confidence: z.number().optional(),
            followUpQuestions: z.array(z.string()).optional()
          }).optional()
        })
      },
      prompt: `{{systemPrompt}}

Previous conversation:
{{#each history}}
{{role}}: {{content}}
{{/each}}

Current user message: {{message}}

Please provide a helpful response as a career assistant. If appropriate, suggest follow-up questions or actions the user can take.`
    });

    const result = await prompt({
      message,
      systemPrompt,
      history: conversationHistory
    });

    return result.output;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate AI response');
  }
};

export const POST = withRateLimit(aiRateLimit)(
  requireAuth(async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const { message, context, history } = assistantRequestSchema.parse(body);

      // Generate AI response
      const aiResponse = await generateResponse(message, context, history);

      // Determine response type based on message content
      let responseType = 'text';
      let metadata = {};

      // Analyze message for specific intents
      const messageLower = message.toLowerCase();
      if (messageLower.includes('resume') || messageLower.includes('cv')) {
        responseType = 'suggestion';
        metadata = { category: 'resume' };
      } else if (messageLower.includes('job') || messageLower.includes('position')) {
        responseType = 'suggestion';
        metadata = { category: 'jobs' };
      } else if (messageLower.includes('interview')) {
        responseType = 'suggestion';
        metadata = { category: 'interview' };
      } else if (messageLower.includes('skill') || messageLower.includes('learn')) {
        responseType = 'suggestion';
        metadata = { category: 'skills' };
      }

      return NextResponse.json({
        success: true,
        message: aiResponse?.response || "I'm here to help with your career questions. Could you be more specific about what you'd like assistance with?",
        type: aiResponse?.type || responseType,
        suggestions: aiResponse?.suggestions || [],
        metadata: aiResponse?.metadata || metadata,
      });

    } catch (error: any) {
      console.error('AI Assistant error:', error);
      
      if (error.name === 'ZodError') {
        return NextResponse.json(
          { success: false, error: error.errors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: 'Failed to process your request' },
        { status: 500 }
      );
    }
  })
);

// Health check endpoint
export const GET = async (request: NextRequest) => {
  return NextResponse.json({
    success: true,
    status: 'AI Assistant is online',
    capabilities: [
      'Resume optimization',
      'Job matching advice',
      'Career guidance',
      'Interview preparation',
      'Skills development'
    ]
  });
};