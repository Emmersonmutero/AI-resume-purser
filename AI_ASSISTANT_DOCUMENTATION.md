# AI Assistant Documentation

This document provides a comprehensive overview of the AI Assistant feature implemented in the AI Resume Parser application.

## Overview

The AI Assistant is an intelligent career counselor that helps users with resume optimization, job matching, career advice, and interview preparation. It uses Google's Genkit AI to provide personalized, context-aware responses based on user data.

## Features

### 🤖 **Core Capabilities**
- **Resume Review & Optimization**: Detailed analysis and improvement suggestions
- **Job Matching**: Personalized job recommendations based on skills and preferences
- **Career Guidance**: Strategic advice for career advancement
- **Interview Preparation**: Tailored interview coaching and practice
- **Skills Assessment**: Identification of skill gaps and learning recommendations

### 💬 **Chat Interface**
- **Real-time Conversations**: Instant responses with typing indicators
- **Context Awareness**: Remembers conversation history and user profile
- **Quick Suggestions**: Pre-built prompts for common queries
- **Mobile Responsive**: Optimized for all device sizes
- **Message History**: Persistent conversation tracking

### 🎯 **User Experience**
- **Floating Widget**: Non-intrusive access from any dashboard page
- **Dedicated Page**: Full-screen chat experience for in-depth conversations
- **Smart Prompts**: Contextual quick-start suggestions
- **Professional Tone**: Encouraging and supportive communication style

## Architecture

### Frontend Components

#### 1. AIChat Component (`/components/ai-assistant/ai-chat.tsx`)
```typescript
interface AIChatProps {
  className?: string;
  userContext?: {
    hasResume?: boolean;
    resumeData?: any;
    jobPreferences?: any;
    recentActivity?: string[];
  };
}
```

**Features:**
- Chat message display with avatars and timestamps
- Real-time typing indicators
- Quick suggestion buttons
- Responsive design with mobile optimization
- Error handling and retry mechanisms

#### 2. AIAssistantWidget Component (`/components/ai-assistant/ai-assistant-widget.tsx`)
```typescript
interface AIAssistantWidgetProps {
  className?: string;
  defaultOpen?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}
```

**Features:**
- Floating action button with notifications
- Collapsible chat window
- Minimize/maximize functionality
- Responsive positioning
- Hover tooltips and animations

#### 3. useAIAssistant Hook
```typescript
const {
  isOpen,
  hasNewMessage,
  openAssistant,
  closeAssistant,
  toggleAssistant,
  notifyNewMessage
} = useAIAssistant();
```

### Backend Implementation

#### 1. API Endpoint (`/api/ai/assistant/route.ts`)
```typescript
POST /api/ai/assistant
```

**Request Schema:**
```typescript
{
  message: string;
  context?: {
    hasResume?: boolean;
    resumeData?: any;
    jobPreferences?: any;
    recentActivity?: string[];
  };
  history?: ChatMessage[];
}
```

**Response Schema:**
```typescript
{
  success: boolean;
  message: string;
  type: 'text' | 'suggestion' | 'action';
  suggestions?: string[];
  metadata?: {
    category?: string;
    confidence?: number;
    followUpQuestions?: string[];
  };
}
```

#### 2. AI Flows (`/ai/flows/career-assistant.ts`)

##### Resume Review Flow
```typescript
const reviewResume = ai.defineFlow({
  name: 'reviewResume',
  inputSchema: ResumeReviewInputSchema,
  outputSchema: ResumeReviewOutputSchema,
});
```

**Output includes:**
- Overall score (1-100)
- Strengths and improvements
- Missing elements
- Skills assessment
- Formatting suggestions

##### Career Advice Flow
```typescript
const provideCareerAdvice = ai.defineFlow({
  name: 'provideCareerAdvice',
  inputSchema: CareerAdviceInputSchema,
  outputSchema: CareerAdviceOutputSchema,
});
```

**Output includes:**
- Strategic career guidance
- Skills to learn
- Career progression path
- Learning resources
- Next steps

##### Interview Preparation Flow
```typescript
const prepareForInterview = ai.defineFlow({
  name: 'prepareForInterview',
  inputSchema: InterviewPrepInputSchema,
  outputSchema: InterviewPrepOutputSchema,
});
```

**Output includes:**
- Preparation strategy
- Common questions with sample answers
- Technical prep requirements
- Questions to ask interviewer
- Confidence building tips

##### Job Matching Analysis Flow
```typescript
const analyzeJobMatch = ai.defineFlow({
  name: 'analyzeJobMatch',
  inputSchema: JobMatchInputSchema,
  outputSchema: JobMatchOutputSchema,
});
```

**Output includes:**
- Match score (0-100)
- Detailed analysis
- Strengths and gaps
- Application tips
- Salary insights

## Integration Points

### Dashboard Integration
The AI Assistant is integrated across all dashboard pages:

#### 1. Floating Widget
- Available on all dashboard pages
- Positioned in bottom-right corner (configurable)
- Hidden on mobile screens smaller than 768px
- Maintains state across page navigation

#### 2. Dedicated Page (`/dashboard/ai-assistant`)
- Full-screen chat experience
- Sidebar with usage tips and capabilities
- Responsive layout for all screen sizes
- Direct access from dashboard navigation

#### 3. Context Awareness
The assistant automatically receives context from:
- User's uploaded resumes
- Job preferences and search history
- Recent platform activity
- Profile information

### Navigation Integration
Added to dashboard sidebar navigation:
```typescript
{ href: '/dashboard/ai-assistant', label: 'AI Assistant', icon: <Bot /> }
```

## Security & Privacy

### Data Protection
- All conversations are processed server-side
- Personal data is not stored permanently in AI models
- User context is limited to current session
- Rate limiting prevents abuse

### Authentication
- Requires valid user authentication
- Role-based access control
- Protected API endpoints
- Secure token validation

### Rate Limiting
- AI endpoints: 10 requests per minute
- Prevents excessive API usage
- Graceful degradation on limit exceeded
- User-friendly error messages

## Usage Examples

### Basic Chat Interaction
```typescript
const response = await fetch('/api/ai/assistant', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: "Can you review my resume?",
    context: {
      hasResume: true,
      resumeData: userResumeData
    },
    history: previousMessages
  })
});
```

### Widget Usage
```tsx
// Simple floating widget
<AIAssistantWidget />

// Customized widget
<AIAssistantWidget 
  position="bottom-left"
  defaultOpen={false}
  className="custom-styling"
/>
```

### Full Chat Page
```tsx
<AIChat 
  className="h-full"
  userContext={{
    hasResume: true,
    resumeData: resume,
    jobPreferences: preferences
  }}
/>
```

## Conversation Examples

### Resume Review Request
**User:** "Can you review my resume and suggest improvements?"

**AI Response:**
```
Based on your resume, here's my analysis:

**Strengths:**
✅ Strong technical skills in React and Node.js
✅ Clear progression in software engineering roles
✅ Quantified achievements with metrics

**Areas for Improvement:**
🔧 Add more specific project outcomes
🔧 Include relevant certifications
🔧 Strengthen the professional summary

**Recommendations:**
1. Add a "Projects" section highlighting key achievements
2. Include keywords from target job descriptions
3. Quantify more accomplishments with numbers

Would you like me to help you rewrite any specific section?
```

### Career Advice Request
**User:** "I'm a junior developer. How can I advance to a senior role?"

**AI Response:**
```
Here's a strategic path to senior developer:

**Timeline:** 2-3 years with focused effort

**Technical Skills to Develop:**
• System design and architecture
• Code review and mentoring abilities
• Performance optimization
• Testing strategies and practices

**Soft Skills:**
• Technical leadership
• Project planning and estimation
• Cross-team collaboration
• Documentation and knowledge sharing

**Action Steps:**
1. Take on increasingly complex features
2. Mentor junior developers or interns
3. Lead a small project or initiative
4. Contribute to technical decisions and discussions

**Learning Resources:**
- System Design courses (Educative, Grokking)
- Senior developer blogs and podcasts
- Open source contributions
- Technical leadership books

Would you like me to elaborate on any of these areas?
```

## Customization Options

### Personality and Tone
The AI assistant maintains:
- Professional yet friendly tone
- Encouraging and supportive responses
- Specific, actionable advice
- Positive reinforcement
- Realistic expectations

### Quick Suggestions
Pre-configured prompts for common scenarios:
- Resume review requests
- Job matching queries
- Career advancement questions
- Interview preparation
- Skills development advice

### Context Adaptation
The assistant adapts responses based on:
- User's experience level
- Industry and role
- Current career stage
- Available resume data
- Job search preferences

## Performance Considerations

### Response Times
- Average API response: 2-4 seconds
- Real-time typing indicators during processing
- Graceful timeout handling (30 seconds)
- Error recovery and retry mechanisms

### Scalability
- Stateless API design
- Rate limiting per user
- Efficient prompt caching
- Optimized AI model usage

### Monitoring
- API response time tracking
- Error rate monitoring
- User engagement metrics
- AI model performance analytics

## Future Enhancements

### Planned Features
1. **Voice Integration**: Speech-to-text and text-to-speech
2. **Document Analysis**: Direct resume file upload and parsing
3. **Interview Simulation**: Mock interview practice sessions
4. **Skill Assessments**: Interactive skill evaluation tools
5. **Learning Paths**: Personalized skill development roadmaps

### Advanced Capabilities
1. **Multi-language Support**: Localized career advice
2. **Industry Specialization**: Domain-specific expertise
3. **Career Tracking**: Long-term progress monitoring
4. **Integration APIs**: Connect with external career platforms
5. **Analytics Dashboard**: Detailed usage and improvement metrics

## Troubleshooting

### Common Issues

#### 1. Assistant Not Responding
**Symptoms:** No response from AI assistant
**Solutions:**
- Check internet connection
- Verify authentication token
- Check API rate limits
- Review browser console for errors

#### 2. Context Not Loading
**Symptoms:** Assistant doesn't seem aware of user data
**Solutions:**
- Verify user profile is complete
- Check resume upload status
- Ensure proper permissions
- Refresh user session

#### 3. Widget Not Appearing
**Symptoms:** Floating widget not visible
**Solutions:**
- Check screen size (hidden on mobile < 768px)
- Verify component import
- Check for JavaScript errors
- Ensure proper authentication

### Error Codes

| Code | Message | Solution |
|------|---------|----------|
| 401 | Authentication required | Login and retry |
| 429 | Rate limit exceeded | Wait and retry |
| 500 | AI processing error | Check AI service status |
| 400 | Invalid request | Verify request format |

## Best Practices

### For Users
1. **Be Specific**: Provide detailed context about your situation
2. **Ask Follow-ups**: Don't hesitate to ask for clarification
3. **Share Context**: Upload resume and set preferences for better advice
4. **Iterate**: Refine questions based on previous responses

### For Developers
1. **Error Handling**: Always implement proper error boundaries
2. **Loading States**: Show appropriate loading indicators
3. **Rate Limiting**: Respect API limits and implement client-side throttling
4. **Context Management**: Efficiently manage user context data
5. **Performance**: Optimize for mobile and slow connections

---

The AI Assistant feature provides a comprehensive career counseling experience that leverages advanced AI to help users achieve their professional goals. It combines intelligent conversation capabilities with deep integration into the platform's ecosystem to deliver personalized, actionable career advice.