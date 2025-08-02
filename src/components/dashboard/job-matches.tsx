import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MatchResumeToJobsOutput } from "@/ai/flows/match-resume-to-jobs";
import { Target, MoreVertical, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { applyForJob, JobPosting } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { ExtractResumeDataOutput } from "@/ai/flows/extract-resume-data";
import { useState } from "react";

type JobMatchesProps = {
  matches: MatchResumeToJobsOutput;
  jobs: JobPosting[];
  resumeData: ExtractResumeDataOutput;
};

export function JobMatches({ matches, jobs, resumeData }: JobMatchesProps) {
  const { toast } = useToast();
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());

  const getBadgeVariant = (score: number) => {
    if (score > 0.85) return "default";
    if (score > 0.7) return "secondary";
    return "outline";
  };

  const handleApply = async (jobId: string, jobTitle: string, score: number) => {
    const result = await applyForJob(jobId, jobTitle, score, resumeData);
    if (result.success) {
      toast({
        title: "Application Sent!",
        description: `You successfully applied for ${jobTitle}.`,
      });
      setAppliedJobs(prev => new Set(prev).add(jobId));
    } else {
      toast({
        title: "Application Failed",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const getJobIdFromDescription = (description: string): string | undefined => {
      const matchedJob = jobs.find(job => `${job.title} at ${job.company}: ${job.description}` === description);
      return matchedJob?.id;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="font-headline flex items-center gap-2 text-lg"><Target/>Top Job Matches</CardTitle>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4"/>
            </Button>
        </div>
        <CardDescription>
          Based on your resume, here are the most relevant job opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-full">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead className="text-right w-[120px]">Score / Apply</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {matches.sort((a, b) => b.matchScore - a.matchScore).map((match, index) => {
                    const jobId = getJobIdFromDescription(match.jobPosting);
                    const isApplied = jobId ? appliedJobs.has(jobId) : false;

                    return (
                        <TableRow key={index}>
                            <TableCell>
                                <p className="font-medium truncate max-w-xs">{match.jobPosting.split(':')[0]}</p>
                                <p className="text-xs text-muted-foreground truncate max-w-xs">{match.reason}</p>
                            </TableCell>
                            <TableCell className="text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <Badge variant={getBadgeVariant(match.matchScore)}>{Math.round(match.matchScore * 100)}%</Badge>
                                   {jobId && (
                                     <Button 
                                        size="sm" 
                                        onClick={() => handleApply(jobId, match.jobPosting.split(':')[0], match.matchScore)}
                                        disabled={isApplied}
                                    >
                                       {isApplied ? <Check className="h-4 w-4"/> : "Apply"}
                                    </Button>
                                   )}
                               </div>
                            </TableCell>
                        </TableRow>
                    )
                 })}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}