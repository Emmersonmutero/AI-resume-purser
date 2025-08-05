"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AIChat } from "./ai-chat";
import { 
  Bot, 
  X, 
  Minimize2, 
  Maximize2,
  MessageCircle,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface AIAssistantWidgetProps {
  className?: string;
  defaultOpen?: boolean;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
}

export function AIAssistantWidget({ 
  className, 
  defaultOpen = false,
  position = "bottom-right"
}: AIAssistantWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useAuth();

  // Hide widget on very small screens
  useEffect(() => {
    const handleResize = () => {
      setIsVisible(window.innerWidth >= 768); // md breakpoint
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get user context for AI assistant
  const getUserContext = () => {
    return {
      hasResume: false, // This would come from actual user data
      resumeData: null,
      jobPreferences: null,
      recentActivity: []
    };
  };

  const getPositionClasses = () => {
    switch (position) {
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "top-left":
        return "top-4 left-4";
      default:
        return "bottom-4 right-4";
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn("fixed z-50", getPositionClasses(), className)}>
      {!isOpen ? (
        // Floating Button
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group relative"
        >
          <div className="relative">
            <Bot className="h-6 w-6" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
          </div>
          
          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI Career Assistant
          </div>
        </Button>
      ) : (
        // Chat Widget
        <Card className={cn(
          "shadow-2xl transition-all duration-300",
          isMinimized ? "h-16" : "h-[500px] w-[380px]"
        )}>
          {/* Widget Header */}
          <div className="flex items-center justify-between p-3 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bot className="h-5 w-5 text-primary" />
                <div className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
                {!isMinimized && (
                  <p className="text-xs text-muted-foreground">
                    Online • Ready to help
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="h-[calc(500px-65px)]">
              <AIChat 
                className="h-full border-0 shadow-none"
                userContext={getUserContext()}
              />
            </div>
          )}

          {/* Minimized Quick Actions */}
          {isMinimized && (
            <div className="flex items-center gap-2 px-3 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setIsMinimized(false)}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Quick Chat
              </Button>
              <div className="text-xs text-muted-foreground">
                Click to expand
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Hook for managing AI Assistant state
export function useAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const openAssistant = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  const closeAssistant = () => {
    setIsOpen(false);
  };

  const toggleAssistant = () => {
    if (isOpen) {
      closeAssistant();
    } else {
      openAssistant();
    }
  };

  const notifyNewMessage = () => {
    if (!isOpen) {
      setHasNewMessage(true);
    }
  };

  return {
    isOpen,
    hasNewMessage,
    openAssistant,
    closeAssistant,
    toggleAssistant,
    notifyNewMessage
  };
}