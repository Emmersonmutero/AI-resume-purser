import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MatchResumeToJobsOutput } from "@/ai/flows/match-resume-to-jobs";
import { Target, MoreVertical } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type JobMatchesProps = {
  matches: MatchResumeToJobsOutput;
};

export function JobMatches({ matches }: JobMatchesProps) {

  const getBadgeVariant = (score: number) => {
    if (score > 0.85) return "default";
    if (score > 0.7) return "secondary";
    return "outline";
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
                        <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                {matches.sort((a, b) => b.matchScore - a.matchScore).map((match, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <p className="font-medium truncate max-w-xs">{match.jobPosting}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{match.reason}</p>
                        </TableCell>
                        <TableCell className="text-right">
                            <Badge variant={getBadgeVariant(match.matchScore)}>{Math.round(match.matchScore * 100)}%</Badge>
                        </TableCell>
                    </TableRow>
                 ))}
                </TableBody>
            </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
