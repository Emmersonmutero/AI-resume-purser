
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createJobPosting, getApplicantsForRecruiter, handleResumeUpload, type ProcessedResumeData } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, PlusCircle, Users, Terminal, Bot } from 'lucide-react';
import { auth } from '@/lib/auth';
import type { Application } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ResumeUpload } from './resume-upload';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { JobMatches } from './job-matches';
import { ResumeDisplay } from './resume-display';

export default function RecruiterDashboardClient() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);

  // State for resume parsing
  const [processedData, setProcessedData] = useState<ProcessedResumeData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const fetchApplicants = async () => {
      if (auth.currentUser) {
          setIsLoadingApplicants(true);
          const fetchedApplicants = await getApplicantsForRecruiter(auth.currentUser.uid);
          setApplicants(fetchedApplicants);
          setIsLoadingApplicants(false);
      }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            fetchApplicants();
        } else {
            setIsLoadingApplicants(false);
            setApplicants([]);
        }
    });
    return () => unsubscribe();
  }, []);

  const handlePostJob = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const result = await createJobPosting(formData);
    
    if (result.success) {
      toast({
        title: 'Job Posted!',
        description: 'Your job posting is now live.',
      });
      setIsDialogOpen(false);
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const onResumeUpload = async (formData: FormData) => {
    setIsParsing(true);
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
      setIsParsing(false);
    }
  };
  
    const getBadgeVariant = (score: number) => {
        if (score > 0.85) return "default";
        if (score > 0.7) return "secondary";
        return "outline";
    }

  return (
    <div className="grid gap-4 md:gap-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold font-headline">Recruiter Dashboard</h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Post New Job
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                     <form onSubmit={handlePostJob}>
                        <DialogHeader>
                        <DialogTitle>Post New Job Vacancy</DialogTitle>
                        <DialogDescription>
                            Fill in the details below to post a new job.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="title" className="text-right">
                                Title
                                </Label>
                                <Input id="title" name="title" className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                             <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="company" className="text-right">
                                Company
                                </Label>
                                <Input id="company" name="company" className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="description" className="text-right mt-2">
                                Description
                                </Label>
                                <Textarea id="description" name="description" className="col-span-3" required disabled={isSubmitting}/>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" disabled={isSubmitting}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Posting...' : 'Post Job'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>AI Resume Parser</CardTitle>
                <CardDescription>Upload a candidate's resume to analyze it and match it against your open job positions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 {error && (
                    <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <ResumeUpload onUpload={onResumeUpload} isLoading={isParsing} />
                 {isParsing && (
                    <Card className="h-full min-h-[400px] flex items-center justify-center">
                        <CardContent className="text-center text-muted-foreground p-8">
                            <div className="flex items-center space-x-2">
                                <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="font-headline text-lg">Analyzing resume...</p>
                            </div>
                            <p className="text-sm mt-2">This may take a few moments. Please wait.</p>
                        </CardContent>
                    </Card>
                )}
                {!processedData && !isParsing && !error && (
                    <Card className="h-full flex items-center justify-center min-h-[200px] border-dashed">
                        <CardContent className="text-center text-muted-foreground p-8">
                            <Bot size={48} className="mx-auto mb-4 text-primary/50" />
                            <p className="font-headline text-lg">Analysis will appear here.</p>
                            <p className="text-sm">Upload a PDF or TXT resume to get started.</p>
                        </CardContent>
                    </Card>
                )}
                {processedData && (
                    <div className="grid lg:grid-cols-2 gap-4 pt-4">
                       <div>
                           <JobMatches 
                                matches={processedData.matches} 
                                jobs={processedData.jobs}
                                resumeData={processedData.resumeData}
                            />
                       </div>
                       <div>
                           <ResumeDisplay resumeData={processedData.resumeData} summary={processedData.summary} />
                       </div>
                    </div>
                )}
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Recent Applicants</CardTitle>
                <CardDescription>The latest candidates who have applied to your job postings.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Applicant</TableHead>
                            <TableHead>Applied For</TableHead>
                            <TableHead>Applied</TableHead>
                            <TableHead className="text-right">Match Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoadingApplicants ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading applicants...</TableCell></TableRow>
                        ) : applicants.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">No applicants yet.</TableCell></TableRow>
                        ) : (
                           applicants.map(app => (
                             <TableRow key={app.id}>
                                <TableCell>
                                    <div className="font-medium">{app.applicantName}</div>
                                    <div className="text-sm text-muted-foreground">{app.applicantEmail}</div>
                                </TableCell>
                                <TableCell>{app.jobTitle}</TableCell>
                                <TableCell>{formatDistanceToNow(app.appliedAt.toDate(), { addSuffix: true })}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={getBadgeVariant(app.matchScore)}>{Math.round(app.matchScore * 100)}%</Badge>
                                </TableCell>
                             </TableRow>
                           ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

    </div>
  );
}
