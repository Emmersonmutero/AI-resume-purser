
"use client";

import { useState, useEffect } from "react";
import type { ProcessedResumeData, UserResume } from "@/lib/actions";
import { ResumeUpload } from "./resume-upload";
import { ResumeDisplay } from "./resume-display";
import { JobMatches } from "./job-matches";
import { handleResumeUpload, getUserResumes } from "@/lib/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Bot, Briefcase, Users, CheckCircle, RefreshCw } from "lucide-react";
import { MatchScoreChart } from "./match-score-chart";
import { JobMatchesSummaryChart } from "./job-matches-summary-chart";
import { JobDistributionChart } from "./job-distribution-chart";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { dataService, type DashboardData } from '@/lib/data-service';
import { useToast } from "@/hooks/use-toast";

export default function DashboardClient() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    setInitialLoading(true);
    setError(null);
    try {
      const data = await dataService.getDashboardData();
      setDashboardData(data);
    } catch (error: any) {
      setError(error.message || 'Failed to load dashboard data');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await dataService.refreshDashboard();
      setDashboardData(data);
      toast({
        title: "Dashboard Refreshed",
        description: "Your dashboard has been updated with the latest data.",
      });
    } catch (error: any) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const onResumeUpload = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const file = formData.get('resume') as File;
      const result = await dataService.uploadResume(file);
      if (result.error) {
        setError(result.error);
        toast({
          title: "Upload Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.data) {
        // Refresh dashboard data after successful upload
        await fetchDashboardData();
        toast({
          title: "Resume Uploaded",
          description: "Your resume has been processed and analyzed successfully.",
        });
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred.');
      toast({
        title: "Upload Error",
        description: error.message || 'An unexpected error occurred.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasResumeData = dashboardData?.resumes && dashboardData.resumes.length > 0;
  const processedData = hasResumeData ? dashboardData.resumes[0].processedData : null;
  const stats = dashboardData?.stats || { totalJobs: 0, goodMatches: 0, greatMatches: 0 };

  if (initialLoading) {
    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-20 sm:h-24" />
                <Skeleton className="h-20 sm:h-24" />
                <Skeleton className="h-20 sm:h-24" />
                <Skeleton className="h-20 sm:h-24" />
            </div>
             <div className="grid gap-4 md:gap-6 lg:gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3 grid gap-4 md:gap-6 lg:gap-8">
                    <Skeleton className="h-64 sm:h-72" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Skeleton className="h-64 sm:h-72" />
                      <Skeleton className="h-64 sm:h-72" />
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <Skeleton className="h-[350px] sm:h-[400px]" />
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-xl sm:text-2xl font-bold font-headline">Your Dashboard</h1>
                <div className="flex gap-2">
                  <Button onClick={handleRefresh} variant="outline" size="sm" disabled={isRefreshing} className="self-start sm:self-auto">
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </Button>
                  <Button onClick={() => router.push('/dashboard/resumes')} size="sm" className="self-start sm:self-auto">
                      Manage My Resumes
                  </Button>
                </div>
            </div>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        <div className="bg-primary/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalJobs}</p>
                        <p className="text-sm text-muted-foreground">Total Jobs Matched</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        <div className="bg-primary/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold">{stats.goodMatches}</p>
                        <p className="text-sm text-muted-foreground">Good Matches (&gt;70%)</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                        <div className="bg-primary/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                        </div>
                        <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold">{stats.greatMatches}</p>
                        <p className="text-sm text-muted-foreground">Great Matches (&gt;85%)</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:gap-6 lg:gap-8 xl:grid-cols-5">
                <div className="xl:col-span-3 space-y-4 md:space-y-6 lg:space-y-8">
                    <JobMatchesSummaryChart matches={processedData?.matches} isLoading={isLoading} />
                    <div className="grid gap-4 md:gap-6 sm:grid-cols-2">
                      <MatchScoreChart matches={processedData?.matches} isLoading={isLoading} />
                      <JobDistributionChart matches={processedData?.matches} isLoading={isLoading} />
                    </div>
                </div>
                <div className="xl:col-span-2">
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
