
'use client';

import { useEffect, useState } from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, UploadCloud, RefreshCw, Trash2, Bot } from 'lucide-react';
import { getUserResumes, type UserResume, handleResumeUpload } from '@/lib/actions';
import { ResumeDisplay } from '@/components/dashboard/resume-display';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function ResumesPage() {
    const [resume, setResume] = useState<UserResume | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const fetchResume = async () => {
        setIsLoading(true);
        const userResume = await getUserResumes();
        setResume(userResume);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchResume();
    }, []);

    const handleReanalyze = () => {
        // Redirect to job seeker dashboard which has the upload/analysis functionality
        router.push('/dashboard/job-seeker');
        toast({
          title: "Ready to Analyze",
          description: "Upload a new resume or re-upload your existing one to start a new analysis.",
        });
    }

  if (isLoading) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <DashboardSidebar />
                <main className="flex-1">
                <DashboardHeader />
                <div className="p-4 sm:p-6 lg:p-8">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-1/2" />
                            <Skeleton className="h-4 w-3/4" />
                        </CardHeader>
                        <CardContent>
                             <Skeleton className="h-40 w-full" />
                        </CardContent>
                    </Card>
                </div>
                </main>
            </div>
        </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1">
          <DashboardHeader />
          <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Resumes</CardTitle>
                    <CardDescription>View and manage your uploaded resumes and their AI analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!resume ? (
                         <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <Bot size={48} className="mx-auto text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-medium">No resume found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">You have not uploaded a resume yet.</p>
                            <Button className="mt-6" onClick={() => router.push('/dashboard/job-seeker')}>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Upload Your First Resume
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Card className="bg-secondary/50">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2"><FileText /> {resume.fileName}</CardTitle>
                                        <CardDescription>
                                            Last analyzed: {new Date(resume.processedData.analyzedAt.seconds * 1000).toLocaleString()}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={handleReanalyze}>
                                            <RefreshCw className="mr-2 h-4 w-4" /> Re-analyze
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>

                            <ResumeDisplay 
                                resumeData={resume.processedData.resumeData}
                                summary={resume.processedData.summary}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
