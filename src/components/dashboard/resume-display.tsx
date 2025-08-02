import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { ExtractResumeDataOutput } from "@/ai/flows/extract-resume-data";
import type { GenerateResumeSummaryOutput } from "@/ai/flows/generate-resume-summary";
import { Briefcase, GraduationCap, Lightbulb, User } from "lucide-react";

type ResumeDisplayProps = {
  resumeData: ExtractResumeDataOutput;
  summary: GenerateResumeSummaryOutput;
};

export function ResumeDisplay({ resumeData, summary }: ResumeDisplayProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2"><User />Parsed Resume</CardTitle>
        <CardDescription>This is the information extracted from your resume.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <h3 className="font-semibold font-headline flex items-center gap-2"><Lightbulb /> AI Summary</h3>
            <p className="text-sm text-muted-foreground">{summary.summary}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold font-headline">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill) => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>

        <div>
            <h3 className="font-semibold font-headline flex items-center gap-2 mb-2"><Briefcase /> Work Experience</h3>
            <Accordion type="single" collapsible defaultValue="experience-0" className="w-full">
                {resumeData.experience.map((exp, index) => (
                    <AccordionItem value={`experience-${index}`} key={index}>
                        <AccordionTrigger>
                            <div className="text-left">
                                <p className="font-medium">{exp.title}</p>
                                <p className="text-sm text-muted-foreground">{exp.company} &middot; {exp.dates}</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{exp.description}</p>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>

        <div>
            <h3 className="font-semibold font-headline flex items-center gap-2 mb-2"><GraduationCap /> Education</h3>
            <Accordion type="single" collapsible className="w-full">
                {resumeData.education.map((edu, index) => (
                    <AccordionItem value={`education-${index}`} key={index}>
                        <AccordionTrigger>
                            <div className="text-left">
                               <p className="font-medium">{edu.degree}</p>
                               <p className="text-sm text-muted-foreground">{edu.institution} &middot; {edu.dates}</p>
                            </div>
                        </AccordionTrigger>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
