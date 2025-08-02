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
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
  const handleCardClick = () => {
    fileInputRef.current?.click();
  }

  const handleFileChange = () => {
    if (formRef.current) {
        const formData = new FormData(formRef.current);
        const file = formData.get('resume') as File;
        if (file && file.size > 0) {
            onUpload(formData);
        }
    }
  }

  return (
    <Card 
        className="relative hover:border-primary/50 cursor-pointer transition-colors"
        onClick={handleCardClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
                <UploadCloud className="w-6 h-6 text-primary" />
            </div>
            <div>
                 <p className="text-lg font-semibold">{isLoading ? 'Analyzing...' : 'Upload Resume'}</p>
                 <p className="text-sm text-muted-foreground">{isLoading ? 'Please wait' : 'Click to select PDF'}</p>
            </div>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="hidden">
          <Input 
            ref={fileInputRef} 
            id="resume" 
            name="resume" 
            type="file" 
            accept=".pdf" 
            required 
            onChange={handleFileChange}
            />
        </form>
      </CardContent>
    </Card>
  );
}
