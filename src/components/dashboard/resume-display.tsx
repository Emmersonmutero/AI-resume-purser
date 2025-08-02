import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ExtractResumeDataOutput } from "@/ai/flows/extract-resume-data";
import type { GenerateResumeSummaryOutput } from "@/ai/flows/generate-resume-summary";
import { Briefcase, GraduationCap, Lightbulb, User, MoreVertical, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

type ResumeDisplayProps = {
  resumeData: ExtractResumeDataOutput;
  summary: GenerateResumeSummaryOutput;
};

export function ResumeDisplay({ resumeData, summary }: ResumeDisplayProps) {
  return (
    <Card className="h-full">
      <CardHeader>
         <div className="flex justify-between items-center">
            <CardTitle className="font-headline flex items-center gap-2 text-lg"><User />Parsed Resume</CardTitle>
             <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4"/>
            </Button>
        </div>
        <CardDescription>This is the information extracted and summarized from your resume by AI.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <h3 className="font-semibold font-headline flex items-center gap-2 text-base"><Lightbulb /> AI Summary</h3>
            <p className="text-sm text-muted-foreground">{summary.summary}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold font-headline flex items-center gap-2 text-base"><Star /> Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold font-headline flex items-center gap-2 mb-2 text-base"><Briefcase /> Work Experience</h3>
                <ScrollArea className="h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Dates</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resumeData.experience.map((exp, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{exp.title}</TableCell>
                            <TableCell>{exp.company}</TableCell>
                            <TableCell>{exp.dates}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </ScrollArea>
            </div>

            <div>
                <h3 className="font-semibold font-headline flex items-center gap-2 mb-2 text-base"><GraduationCap /> Education</h3>
                 <ScrollArea className="h-64">
                     <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Degree</TableHead>
                          <TableHead>Institution</TableHead>
                          <TableHead>Dates</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resumeData.education.map((edu, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{edu.degree}</TableCell>
                            <TableCell>{edu.institution}</TableCell>
                            <TableCell>{edu.dates}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                </ScrollArea>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
