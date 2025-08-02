"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ResumeUploadProps = {
  onUpload: (formData: FormData) => void;
  isLoading: boolean;
};

export function ResumeUpload({ onUpload, isLoading }: ResumeUploadProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('resume') as File;
    if (!file || file.size === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }
    onUpload(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Upload Your Resume</CardTitle>
        <CardDescription>Upload your resume (PDF, max 5MB) to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="resume">Resume PDF</Label>
            <Input id="resume" name="resume" type="file" accept=".pdf" required />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Analyzing..." : <><UploadCloud className="mr-2 h-4 w-4" /> Analyze Resume</>}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
