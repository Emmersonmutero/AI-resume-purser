"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Bot, 
  User, 
  Send, 
  Sparkles, 
  FileText, 
  Briefcase, 
  TrendingUp,
  Lightbulb,
  MessageCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "suggestion" | "action";
  metadata?: {
    resumeId?: string;
    jobId?: string;
    suggestion?: string;
  };
}

interface AIChatProps {
  className?: string;
  userContext?: {
    hasResume?: boolean;
    resumeData?: any;
    jobPreferences?: any;
    recentActivity?: string[];
  };
}

const QUICK_SUGGESTIONS = [
  {
    icon: FileText,
    title: "Resume Review",
    message: "Can you review my resume and suggest improvements?",
    category: "resume"
  },
  {
    icon: Briefcase,
    title: "Job Matching",
    message: "What jobs are the best match for my skills?",
    category: "jobs"
  },
  {
    icon: TrendingUp,
    title: "Career Advice",
    message: "What skills should I develop to advance my career?",
    category: "career"
  },
  {
    icon: Lightbulb,
    title: "Interview Tips",
    message: "Can you help me prepare for my upcoming interview?",
    category: "interview"
  }
];

export function AIChat({ className, userContext }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi! I'm your AI career assistant. I can help you optimize your resume, find the best job matches, and provide career advice. How can I assist you today?",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          context: userContext,
          history: messages.slice(-5) // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        type: data.type || "text",
        metadata: data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Assistant error:", error);
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive",
      });

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        timestamp: new Date(),
        type: "text"
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickSuggestion = (suggestion: typeof QUICK_SUGGESTIONS[0]) => {
    sendMessage(suggestion.message);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card className={cn("flex flex-col h-full max-h-[600px]", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="relative">
            <Bot className="h-5 w-5 text-primary" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
          </div>
          AI Career Assistant
          <Badge variant="secondary" className="text-xs">
            Beta
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 pb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div
                    className={cn(
                      "text-xs mt-1 opacity-70",
                      message.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-secondary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="text-muted-foreground">AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Quick Suggestions - Show only at start */}
            {messages.length === 1 && (
              <div className="space-y-3 pt-4">
                <Separator />
                <div className="text-sm font-medium text-muted-foreground">
                  Quick suggestions:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_SUGGESTIONS.map((suggestion, index) => {
                    const Icon = suggestion.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto p-3 justify-start text-left"
                        onClick={() => handleQuickSuggestion(suggestion)}
                        disabled={isLoading}
                      >
                        <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-xs">
                            {suggestion.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {suggestion.message}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about your career..."
              disabled={isLoading}
              className="flex-1"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <div className="text-xs text-muted-foreground mt-2 text-center">
            AI responses may not always be accurate. Please verify important information.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}