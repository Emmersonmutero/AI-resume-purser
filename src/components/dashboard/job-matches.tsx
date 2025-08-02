import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MatchResumeToJobsOutput } from "@/ai/flows/match-resume-to-jobs";
import { Target } from "lucide-react";

type JobMatchesProps = {
  matches: MatchResumeToJobsOutput;
};

export function JobMatches({ matches }: JobMatchesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2"><Target/>Top Job Matches</CardTitle>
        <CardDescription>
          Based on your resume, here are the most relevant job opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {matches.sort((a, b) => b.matchScore - a.matchScore).map((match, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <p className="font-semibold text-sm">{match.jobPosting}</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center">
                 <p className="text-xs text-muted-foreground">Match Score</p>
                 <span className="text-xs font-semibold text-primary">{Math.round(match.matchScore * 100)}%</span>
              </div>
              <Progress value={match.matchScore * 100} className="h-2" />
              <p className="text-xs text-muted-foreground pt-1 italic">
                <strong>Reason:</strong> {match.reason}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
