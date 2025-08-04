
"use client";

import { useState, useEffect } from "react";
import type { ProcessedResumeData, UserResume } from "@/lib/actions";
import { ResumeUpload } from "./resume-upload";
import { ResumeDisplay } from "./resume-display";
import { JobMatches } from "./job-matches";
import { handleResumeUpload, getUserResumes } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Bot, Briefcase, Users, CheckCircle } from "lucide-react";
import { MatchScoreChart } from "./match-score-chart";
import { JobMatchesSummaryChart } from "./job-matches-summary-chart";
import { JobDistributionChart } from "./job-distribution-chart";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function DashboardClient() {
  const [processedData, setProcessedData] = useState<ProcessedResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchExistingResume = async () => {
    setInitialLoading(true);
    const existingResume: UserResume | null = await getUserResumes();
    if (existingResume) {
      setProcessedData(existingResume.processedData);
    }
    setInitialLoading(false);
  }

  useEffect(() => {
    fetchExistingResume();
  }, []);


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

  const getMatchStats = () => {
    if (!processedData) return { totalJobs: 0, goodMatches: 0, greatMatches: 0 };
    return {
      totalJobs: processedData.matches.length,
      goodMatches: processedData.matches.filter(m => m.matchScore >= 0.7 && m.matchScore < 0.85).length,
      greatMatches: processedData.matches.filter(m => m.matchScore >= 0.85).length,
    }
  }

  const stats = getMatchStats();

  if (initialLoading) {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
             <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3 grid gap-4 md:gap-8 sm:grid-cols-2">
                    <Skeleton className="sm:col-span-2 h-72" />
                    <Skeleton className="h-72" />
                    <Skeleton className="h-72" />
                </div>
                <div className="lg:col-span-2">
                    <Skeleton className="h-[400px]" />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-8">
       {error && (
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!processedData && !isLoading && (
        <Card className="h-full flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center text-muted-foreground p-8">
                <Bot size={48} className="mx-auto mb-4 text-primary/50" />
                <p className="font-headline text-lg">Welcome to Your Dashboard</p>
                <p className="text-sm mb-4">Upload your resume to get started and find your perfect job match.</p>
                <ResumeUpload onUpload={onResumeUpload} isLoading={isLoading} />
            </CardContent>
        </Card>
      )}

      {isLoading && (
            <Card className="h-full min-h-[400px] flex items-center justify-center">
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
      
      {processedData && (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold font-headline">Your Dashboard</h1>
                <Button onClick={() => router.push('/dashboard/resumes')}>
                    Manage My Resumes
                </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                        <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                        <p className="text-2xl font-bold">{stats.totalJobs}</p>
                        <p className="text-sm text-muted-foreground">Total Jobs Matched</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                        <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                        <p className="text-2xl font-bold">{stats.goodMatches}</p>
                        <p className="text-sm text-muted-foreground">Good Matches (&gt;70%)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                        <CheckCircle className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                        <p className="text-2xl font-bold">{stats.greatMatches}</p>
                        <p className="text-sm text-muted-foreground">Great Matches (&gt;85%)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3 grid gap-4 md:gap-8 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <JobMatchesSummaryChart matches={processedData?.matches} isLoading={isLoading} />
                    </div>
                    <MatchScoreChart matches={processedData?.matches} isLoading={isLoading} />
                    <JobDistributionChart matches={processedData?.matches} isLoading={isLoading} />
                </div>
                <div className="lg:col-span-2">
                    <JobMatches 
                        matches={processedData.matches} 
                        jobs={processedData.jobs}
                        resumeData={processedData.resumeData}
                    />
                </div>
            </div>
        </>
      )}

    </div>
  );
}
