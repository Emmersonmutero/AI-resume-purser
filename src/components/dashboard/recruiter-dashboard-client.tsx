'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createJobPosting, getApplicantsForRecruiter } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Briefcase, PlusCircle, Users } from 'lucide-react';
import { auth } from '@/lib/firebase';
import type { Application } from '@/lib/actions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';


export default function RecruiterDashboardClient() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [isLoadingApplicants, setIsLoadingApplicants] = useState(true);

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
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{isLoadingApplicants ? '...' : applicants.length}</div>
                    <p className="text-xs text-muted-foreground">New applicants this month</p>
                </CardContent>
            </Card>
            {/* Add more analytics cards here */}
        </div>

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