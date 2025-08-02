"use client";

import { useState } from "react";
import type { ProcessedResumeData } from "@/lib/actions";
import { ResumeUpload } from "./resume-upload";
import { ResumeDisplay } from "./resume-display";
import { JobMatches } from "./job-matches";
import { handleResumeUpload } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Bot } from "lucide-react";

export default function DashboardClient() {
  const [processedData, setProcessedData] = useState<ProcessedResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onResumeUpload = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setProcessedData(null);
    try {
      const result = await handleResumeUpload(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setProcessedData(result.data);
      }
    } catch (e) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-8">
          <ResumeUpload onUpload={onResumeUpload} isLoading={isLoading} />
          {processedData && <JobMatches matches={processedData.matches} />}
        </div>
        
        <div className="space-y-8">
          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!processedData && !isLoading && !error && (
             <Card className="h-full flex items-center justify-center min-h-[500px]">
                <CardContent className="text-center text-muted-foreground p-8">
                    <Bot size={48} className="mx-auto mb-4 text-primary/50" />
                    <p className="font-headline text-lg">Your resume analysis will appear here.</p>
                    <p>Upload your PDF resume to get started.</p>
                </CardContent>
             </Card>
          )}

          {isLoading && (
             <Card className="h-full flex items-center justify-center min-h-[500px]">
                <CardContent className="text-center text-muted-foreground p-8">
                    <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="font-headline text-lg">Analyzing your resume...</p>
                    </div>
                     <p className="text-sm mt-2">This may take a few moments. Please wait.</p>
                </CardContent>
             </Card>
          )}

          {processedData && <ResumeDisplay resumeData={processedData.resumeData} summary={processedData.summary} />}
        </div>
      </div>
    </div>
  );
}
